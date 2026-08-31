"use server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

export async function askFinancialAI(
  userPrompt: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ reply: string; suggestions?: string[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      reply: "Sua sessão expirou. Faça login novamente para consultar seus dados.",
    };
  }

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  // Buscar contexto financeiro em tempo real do usuário
  const [
    { data: profile },
    { data: accounts },
    { data: cards },
    { data: categories },
    { data: budgets },
    { data: goals },
    { data: transactions },
  ] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("accounts").select("nome, saldo_inicial, tipo").eq("user_id", user.id).eq("ativa", true),
    supabase.from("credit_cards").select("nome, limite, dia_vencimento, dia_fechamento").eq("user_id", user.id).eq("ativo", true),
    supabase.from("categories").select("id, nome, tipo"),
    supabase.from("budgets").select("valor_limite, categoria_id").eq("user_id", user.id),
    supabase.from("financial_goals").select("nome, valor_alvo, valor_atual, prazo").eq("user_id", user.id),
    supabase.from("transactions").select("descricao, valor, tipo, data, categoria_id, cartao_id, status").eq("user_id", user.id).gte("data", firstDay).lte("data", lastDay),
  ]);

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";
  const catMap = new Map((categories || []).map((c) => [c.id, c.nome]));

  // Cálculos consolidados
  let totalReceitas = 0;
  let totalDespesas = 0;
  let despesasAgendadas = 0;
  const gastosPorCategoria: Record<string, number> = {};

  (transactions || []).forEach((t) => {
    const val = Number(t.valor);
    if (t.status === "agendada") {
      if (t.tipo === "despesa") despesasAgendadas += val;
    } else {
      if (t.tipo === "receita") totalReceitas += val;
      if (t.tipo === "despesa") {
        totalDespesas += val;
        const cat = catMap.get(t.categoria_id) || "Outros";
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + val;
      }
    }
  });

  const saldoLiquido = totalReceitas - totalDespesas;
  const topCategorias = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => `${cat}: ${formatCurrency(val)}`)
    .join(", ");

  const orcamentosInfo = (budgets || []).map((b) => {
    const cat = catMap.get(b.categoria_id) || "Categoria";
    const gasto = gastosPorCategoria[cat] || 0;
    const teto = Number(b.valor_limite || 0);
    return `${cat}: gasto ${formatCurrency(gasto)} de teto ${formatCurrency(teto)}`;
  }).join("; ");

  const metasInfo = (goals || []).map((g) => {
    return `${g.nome}: ${formatCurrency(Number(g.valor_atual || 0))} de ${formatCurrency(Number(g.valor_alvo || 0))}`;
  }).join("; ");

  const contextoFinanceiro = `
Dados financeiros de ${userName} no mês atual:
- Receitas deste mês: ${formatCurrency(totalReceitas)}
- Despesas pagas deste mês: ${formatCurrency(totalDespesas)}
- Despesas agendadas para o resto do mês: ${formatCurrency(despesasAgendadas)}
- Saldo líquido atual: ${formatCurrency(saldoLiquido)}
- Principais gastos por categoria: ${topCategorias || "Nenhum gasto registrado ainda"}
- Orçamentos definidos: ${orcamentosInfo || "Nenhum orçamento configurado"}
- Metas de economia: ${metasInfo || "Nenhuma meta cadastrada"}
- Cartões cadastrados: ${(cards || []).map(c => `${c.nome} (limite ${formatCurrency(Number(c.limite || 0))}, vence dia ${c.dia_vencimento})`).join(", ") || "Nenhum"}
- Contas bancárias: ${(accounts || []).map(a => `${a.nome} (${a.tipo || "corrente"})`).join(", ") || "Nenhuma"}
`;

  // 1. Tentar chamar a API do Google Gemini (se GEMINI_API_KEY estiver configurada nas envs)
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `Você é um Consultor Financeiro Pessoal amigável, direto, inteligente e motivador do aplicativo "Meu Dinheiro".
Responda a dúvida do usuário de forma concisa, prática e com números reais baseados no contexto abaixo.

${contextoFinanceiro}

Histórico da conversa:
${history.slice(-4).map((h) => `${h.role === "user" ? "Usuário" : "Assistente"}: ${h.content}`).join("\n")}

Pergunta do usuário: ${userPrompt}

Instruções:
- Seja encorajador, use formatação clara em Markdown (com tópicos e negrito).
- Dê recomendações concretas de corte ou remanejamento de dinheiro se necessário.
- Destaque valores em R$.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text,
            suggestions: [
              "Onde posso economizar este mês?",
              "Como está o progresso das minhas metas?",
              "Qual foi o meu maior gasto?",
            ],
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, fallback to native financial engine:", err);
    }
  }

  // 2. Motor Heurístico / Inteligência Financeira Nativa (Gratuito, Instantâneo e Offline)
  const q = userPrompt.toLowerCase();

  let reply = "";

  if (q.includes("economizar") || q.includes("poupar") || q.includes("guardar")) {
    reply = `Olá, **${userName}**! Analisando seus dados deste mês:\n\n` +
      `- **Total gasto:** ${formatCurrency(totalDespesas)}\n` +
      `- **Principais categorias:** ${topCategorias || "Você ainda não tem grandes despesas registradas."}\n\n` +
      `💡 **Recomendações do Assistente:**\n` +
      `1. Reduza em 15% os gastos nas suas categorias de maior volume.\n` +
      `2. Você tem ${formatCurrency(despesasAgendadas)} em contas agendadas até o fim do mês.\n` +
      `3. Se conseguir guardar R$ 100 por semana, acumulará R$ 400 a mais todo mês para suas metas!`;
  } else if (q.includes("meta") || q.includes("objetivo")) {
    if (!goals || goals.length === 0) {
      reply = `Você ainda não cadastrou metas financeiras! Que tal definir uma meta de **Reserva de Emergência** ou **Investimentos** na aba de [Metas](/metas)?`;
    } else {
      reply = `🎯 **Status das suas Metas:**\n\n` +
        metasInfo.split("; ").map((m) => `• ${m}`).join("\n") +
        `\n\n💡 Continue fazendo aportes mensais para acelerar o alcance dos seus objetivos!`;
    }
  } else if (q.includes("orçamento") || q.includes("limite") || q.includes("teto")) {
    if (!budgets || budgets.length === 0) {
      reply = `Você ainda não definiu tetos de orçamento! Vá na aba de [Orçamentos](/orcamentos) para estipular limites por categoria e evitar surpresas no final do mês.`;
    } else {
      reply = `📊 **Acompanhamento de Orçamentos do Mês:**\n\n` +
        orcamentosInfo.split("; ").map((o) => `• ${o}`).join("\n");
    }
  } else if (q.includes("maior") || q.includes("gasto") || q.includes("categoria")) {
    reply = `🔍 **Visão dos seus Gastos:**\n\n` +
      `- **Despesas pagas:** ${formatCurrency(totalDespesas)}\n` +
      `- **Distribuição:** ${topCategorias || "Sem lançamentos recentes."}\n\n` +
      `Seu saldo líquido no momento é de **${formatCurrency(saldoLiquido)}**.`;
  } else {
    reply = `Olá, **${userName}**! 🤖 Aqui está o seu resumo financeiro em tempo real:\n\n` +
      `• **Receitas no mês:** ${formatCurrency(totalReceitas)}\n` +
      `• **Despesas pagas:** ${formatCurrency(totalDespesas)}\n` +
      `• **Despesas agendadas:** ${formatCurrency(despesasAgendadas)}\n` +
      `• **Resultado líquido:** ${formatCurrency(saldoLiquido)}\n\n` +
      `Como posso te ajudar a melhorar seu controle financeiro hoje?`;
  }

  return {
    reply,
    suggestions: [
      "Como posso economizar este mês?",
      "Quais foram meus maiores gastos?",
      "Como estão minhas metas financeiras?",
      "Acompanhar meus orçamentos",
    ],
  };
}
