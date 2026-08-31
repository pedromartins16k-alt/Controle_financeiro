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
    supabase.from("credit_cards").select("id, nome, limite, dia_vencimento, dia_fechamento").eq("user_id", user.id).eq("ativo", true),
    supabase.from("categories").select("id, nome, tipo"),
    supabase.from("budgets").select("valor_limite, categoria_id").eq("user_id", user.id),
    supabase.from("financial_goals").select("nome, valor_alvo, valor_atual, prazo").eq("user_id", user.id),
    supabase.from("transactions").select("descricao, valor, tipo, data, categoria_id, cartao_id, status, forma_pagamento").eq("user_id", user.id).gte("data", firstDay).lte("data", lastDay),
  ]);

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";
  const catMap = new Map((categories || []).map((c) => [c.id, c.nome]));

  // Cálculos consolidados
  let totalReceitas = 0;
  let totalDespesas = 0;
  let despesasAgendadas = 0;
  let receitasAgendadas = 0;
  const gastosPorCategoria: Record<string, number> = {};
  const transacoesDescricao: Array<{ descricao: string; valor: number; tipo: string; data: string }> = [];

  (transactions || []).forEach((t) => {
    const val = Number(t.valor);
    transacoesDescricao.push({
      descricao: t.descricao,
      valor: val,
      tipo: t.tipo,
      data: t.data,
    });

    if (t.status === "agendada") {
      if (t.tipo === "despesa") despesasAgendadas += val;
      if (t.tipo === "receita") receitasAgendadas += val;
    } else {
      if (t.tipo === "receita") totalReceitas += val;
      if (t.tipo === "despesa") {
        totalDespesas += val;
        const cat = catMap.get(t.categoria_id) || "Outros";
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + val;
      }
    }
  });

  const saldoAtual = totalReceitas - totalDespesas;
  const saldoPrevistoFimMes = saldoAtual + receitasAgendadas - despesasAgendadas;

  const topCategoriasList = Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]);
  const topCategorias = topCategoriasList.map(([cat, val]) => `${cat}: ${formatCurrency(val)}`).join(", ");

  const orcamentosInfo = (budgets || []).map((b) => {
    const cat = catMap.get(b.categoria_id) || "Categoria";
    const gasto = gastosPorCategoria[cat] || 0;
    const teto = Number(b.valor_limite || 0);
    return `${cat}: gasto ${formatCurrency(gasto)} de teto ${formatCurrency(teto)}`;
  }).join("; ");

  const metasInfo = (goals || []).map((g) => {
    return `${g.nome}: ${formatCurrency(Number(g.valor_atual || 0))} acumulado de ${formatCurrency(Number(g.valor_alvo || 0))}`;
  }).join("; ");

  // 1. Chamar Groq se houver chave configurada (Super Rápido)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const systemPrompt = `Você é o "Assistente Financeiro IA" pessoal de ${userName}.
Seu objetivo é ser direto, simpático, motivador e responder SEMPRE com precisão à dúvida específica do usuário.
Responda em Português do Brasil com formatação rica em Markdown (listas, negrito e emojis).

DADOS FINANCEIROS EM TEMPO REAL DE ${userName.toUpperCase()}:
- Receitas efetivadas no mês: ${formatCurrency(totalReceitas)}
- Receitas agendadas (a receber): ${formatCurrency(receitasAgendadas)}
- Despesas já pagas: ${formatCurrency(totalDespesas)}
- Despesas agendadas (a pagar no mês): ${formatCurrency(despesasAgendadas)}
- Saldo atual líquido em caixa: ${formatCurrency(saldoAtual)}
- Previsão de Saldo até o fim do mês: ${formatCurrency(saldoPrevistoFimMes)}
- Gastos por Categoria: ${topCategorias || "Nenhum gasto registrado"}
- Orçamentos/Tetos: ${orcamentosInfo || "Nenhum teto configurado"}
- Metas Financeiras: ${metasInfo || "Nenhuma meta cadastrada"}
- Cartões de Crédito: ${(cards || []).map(c => `${c.nome} (limite ${formatCurrency(Number(c.limite || 0))})`).join(", ") || "Nenhum"}

REGRAS:
1. Responda diretamente ao que o usuário perguntar. Se ele perguntar o nome, diga que é o Assistente Financeiro IA. Se perguntar o saldo previsto, informe ${formatCurrency(saldoPrevistoFimMes)} e explique o cálculo.
2. NUNCA coloque asteriscos (**) ao redor do nome ${userName} (escreva apenas ${userName}).
3. Seja conciso e use formatação limpa.`;

      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...history.slice(-6).map((h) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: userPrompt },
      ];

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: messagesPayload,
          temperature: 0.4,
          max_tokens: 700,
        }),
      });

      if (groqRes.ok) {
        const groqJson = await groqRes.json();
        const text = groqJson.choices?.[0]?.message?.content;
        if (text) {
          return {
            reply: text,
            suggestions: [
              "Qual o saldo previsto até o fim do mês?",
              "Como posso economizar este mês?",
              "Quais foram meus maiores gastos?",
              "Como estão minhas metas financeiras?",
            ],
          };
        }
      }
    } catch (err) {
      console.warn("Groq API fallback:", err);
    }
  }

  // 2. Chamar Google Gemini se houver chave configurada
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiApiKey) {
    try {
      const systemPrompt = `Você é um Consultor Financeiro Pessoal amigável, direto e motivador chamado "Assistente Meu Dinheiro".
Dados financeiros reais de ${userName} neste mês:
- Receitas efetivadas: ${formatCurrency(totalReceitas)}
- Despesas pagas: ${formatCurrency(totalDespesas)}
- Despesas agendadas (a vencer no mês): ${formatCurrency(despesasAgendadas)}
- Saldo atual líquido: ${formatCurrency(saldoAtual)}
- Saldo previsto até o fim do mês: ${formatCurrency(saldoPrevistoFimMes)}
- Gastos por categoria: ${topCategorias || "Sem gastos registrados"}
- Orçamentos: ${orcamentosInfo || "Nenhum teto configurado"}
- Metas: ${metasInfo || "Nenhuma meta cadastrada"}
- Cartões: ${(cards || []).map(c => `${c.nome} (limite ${formatCurrency(Number(c.limite || 0))})`).join(", ") || "Nenhum"}

Responda diretamente à dúvida do usuário com clareza, usando Markdown com tópicos e números formatados em R$.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nPergunta de ${userName}: ${userPrompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text,
            suggestions: [
              "Como posso economizar este mês?",
              "Quais foram meus maiores gastos?",
              "Qual o saldo previsto até o fim do mês?",
            ],
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API fallback to advanced engine:", err);
    }
  }

  // 2. Motor Heurístico & Processador de Linguagem Natural Especializado
  const q = userPrompt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let reply = "";
  let suggestions = [
    "Como posso economizar este mês?",
    "Quais foram meus maiores gastos?",
    "Como estão minhas metas financeiras?",
    "Qual o saldo previsto até o fim do mês?",
  ];

  // Intenção: Saldo Previsto / Fim do Mês
  if (q.includes("saldo previsto") || q.includes("fim do mes") || q.includes("final do mes") || q.includes("saldo futuro") || q.includes("vai sobrar")) {
    reply = `📈 **Projeção de Saldo para o Fim do Mês:**\n\n` +
      `• **Saldo Atual (Líquido):** ${formatCurrency(saldoAtual)}\n` +
      `• **Receitas Agendadas:** + ${formatCurrency(receitasAgendadas)}\n` +
      `• **Despesas Agendadas (A Pagar):** - ${formatCurrency(despesasAgendadas)}\n\n` +
      `🎯 **Saldo Estimado ao Final do Mês:** **${formatCurrency(saldoPrevistoFimMes)}**\n\n` +
      (saldoPrevistoFimMes >= 0
        ? `✨ Você fechará o mês no positivo! Uma ótima oportunidade para aportar nas suas [Metas Financeiras](/metas).`
        : `⚠️ Atenção: Suas despesas agendadas superam as receitas previstas em ${formatCurrency(Math.abs(saldoPrevistoFimMes))}. Recomendo revisar os lançamentos na aba de [Transações](/transacoes).`);
    suggestions = ["Como posso economizar este mês?", "Quais foram meus maiores gastos?", "Acompanhar meus orçamentos"];
  }

  // Intenção: Dicas de Economia / Poupar
  else if (q.includes("economizar") || q.includes("poupar") || q.includes("guardar") || q.includes("cortar gasto") || q.includes("dica")) {
    const maiorCat = topCategoriasList[0];
    reply = `💡 **Diagnóstico de Economia para ${userName}:**\n\n` +
      `• **Total desembolsado no mês:** ${formatCurrency(totalDespesas)}\n` +
      (maiorCat ? `• **Maior foco de gasto:** Categoria **${maiorCat[0]}** (${formatCurrency(maiorCat[1])})\n\n` : `\n`) +
      `📌 **Plano de Ação Recomendado:**\n` +
      `1. **Regra dos 10%**: Tente reduzir 10% nas despesas de ${maiorCat ? maiorCat[0] : "consumo diário"}, economizando cerca de ${maiorCat ? formatCurrency(maiorCat[1] * 0.1) : "R$ 50,00"}.\n` +
      `2. **Atenção aos Recorrentes**: Você tem ${formatCurrency(despesasAgendadas)} em contas agendadas. Verifique se há assinaturas que não usa com frequência.\n` +
      `3. **Poupe no início**: Assim que receber suas receitas, separe primeiro o valor da sua meta antes de gastar com supérfluos.`;
    suggestions = ["Qual o saldo previsto até o fim do mês?", "Como estão minhas metas financeiras?", "Quais foram meus maiores gastos?"];
  }

  // Intenção: Maiores Gastos / Onde foi o dinheiro
  else if (q.includes("maior") || q.includes("gasto") || q.includes("onde foi") || q.includes("gastando mais") || q.includes("despesas")) {
    if (topCategoriasList.length === 0) {
      reply = `Você ainda não possui despesas registradas neste mês. Assim que fizer novos lançamentos, mostrarei o ranking exato!`;
    } else {
      reply = `🔍 **Ranking dos seus Gastos no Mês:**\n\n` +
        topCategoriasList.map(([cat, val], idx) => `${idx + 1}º **${cat}**: ${formatCurrency(val)} (${Math.round((val / (totalDespesas || 1)) * 100)}% do total)`).join("\n") +
        `\n\n💰 **Total de Despesas Efetivadas:** **${formatCurrency(totalDespesas)}**`;
    }
    suggestions = ["Como posso economizar este mês?", "Qual o saldo previsto até o fim do mês?", "Acompanhar meus orçamentos"];
  }

  // Intenção: Metas Financeiras
  else if (q.includes("meta") || q.includes("objetivo") || q.includes("reserva") || q.includes("sonho")) {
    if (!goals || goals.length === 0) {
      reply = `Você ainda não cadastrou nenhuma meta financeira! Definir metas (ex: *Reserva de Emergência*, *Viagem*, *Carro*) ajuda a manter o foco para poupar.\n\n👉 Cadastre sua primeira meta na aba [Metas](/metas)!`;
    } else {
      reply = `🎯 **Status das suas Metas Financeiras:**\n\n` +
        (goals || []).map((g) => {
          const atual = Number(g.valor_atual || 0);
          const alvo = Number(g.valor_alvo || 0);
          const pct = alvo > 0 ? Math.min(100, Math.round((atual / alvo) * 100)) : 0;
          return `• **${g.nome}**: ${formatCurrency(atual)} de ${formatCurrency(alvo)} (**${pct}% atingido**)`;
        }).join("\n") +
        `\n\n💡 Dica: Que tal programar um aporte mensal recorrente para bater essas metas mais rápido?`;
    }
    suggestions = ["Como posso economizar este mês?", "Qual o saldo previsto até o fim do mês?", "Quais foram meus maiores gastos?"];
  }

  // Intenção: Orçamentos
  else if (q.includes("orcamento") || q.includes("teto") || q.includes("limite")) {
    if (!budgets || budgets.length === 0) {
      reply = `Você ainda não configurou orçamentos mensais! Estipular tetos por categoria (ex: Alimentação, Lazer) evita que você gaste mais do que ganha.\n\n👉 Crie seus limites na aba [Orçamentos](/orcamentos)!`;
    } else {
      reply = `📊 **Acompanhamento de Orçamentos do Mês:**\n\n` +
        (budgets || []).map((b) => {
          const cat = catMap.get(b.categoria_id) || "Categoria";
          const gasto = gastosPorCategoria[cat] || 0;
          const teto = Number(b.valor_limite || 0);
          const pct = teto > 0 ? Math.round((gasto / teto) * 100) : 0;
          const status = pct >= 100 ? "🚨 ESTOURADO" : pct >= 80 ? "⚠️ ATENÇÃO" : "✅ NORMAL";
          return `• **${cat}**: ${formatCurrency(gasto)} / ${formatCurrency(teto)} (${pct}% - ${status})`;
        }).join("\n");
    }
    suggestions = ["Como posso economizar este mês?", "Qual o saldo previsto até o fim do mês?", "Quais foram meus maiores gastos?"];
  }

  // Intenção: Cartões e Faturas
  else if (q.includes("cartao") || q.includes("fatura") || q.includes("credito") || q.includes("limite")) {
    if (!cards || cards.length === 0) {
      reply = `Você ainda não cadastrou cartões de crédito. Acesse a aba [Cartões](/cartoes) para registrar seus cartões e acompanhar faturas em tempo real!`;
    } else {
      reply = `💳 **Visão dos seus Cartões de Crédito:**\n\n` +
        cards.map((c) => {
          const gastos = (transactions || [])
            .filter((t) => t.cartao_id === c.id && t.tipo === "despesa")
            .reduce((acc, t) => acc + Number(t.valor), 0);
          const limite = Number(c.limite || 0);
          const disp = Math.max(0, limite - gastos);
          return `• **${c.nome}**: Fatura atual em **${formatCurrency(gastos)}** | Vencimento dia **${c.dia_vencimento}** (Limite disponível: ${formatCurrency(disp)})`;
        }).join("\n");
    }
    suggestions = ["Qual o saldo previsto até o fim do mês?", "Como posso economizar este mês?", "Quais foram meus maiores gastos?"];
  }

  // Intenção Genérica / Boas-vindas
  else {
    reply = `Olá, ${userName}! 🤖 Aqui está o seu panorama financeiro atual:\n\n` +
      `• **Receitas Recebidas:** ${formatCurrency(totalReceitas)}\n` +
      `• **Despesas Efetivadas:** ${formatCurrency(totalDespesas)}\n` +
      `• **Saldo em Caixa:** **${formatCurrency(saldoAtual)}**\n` +
      `• **Previsão até o fim do mês:** **${formatCurrency(saldoPrevistoFimMes)}**\n\n` +
      `O que gostaria de detalhar agora?`;
  }

  return {
    reply,
    suggestions,
  };
}
