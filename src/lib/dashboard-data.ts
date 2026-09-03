import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardSummary,
  EvolucaoPoint,
  ChartPeriod,
  CategoriaGasto,
  TransactionRow,
  OrcamentoRow,
  MetaRow,
} from "@/lib/types";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfNextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export interface DashboardData {
  summary: DashboardSummary;
  evolucao: EvolucaoPoint[];
  evolucaoPorPeriodo: Record<ChartPeriod, EvolucaoPoint[]>;
  gastosPorCategoria: CategoriaGasto[];
  transacoesRecentes: TransactionRow[];
  orcamentos: OrcamentoRow[];
  metas: MetaRow[];
  temContas: boolean;
}

/**
 * Retorna null quando não há base de comparação válida (mês anterior <= 0 ou ausente).
 * O componente exibirá "Sem comparação" ou "Primeiro período registrado".
 */
function pctChange(current: number, previous: number): number | null {
  if (!previous || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardData> {
  const now = new Date();
  const mesAtualInicio = startOfMonth(now);
  const mesAtualFim = startOfNextMonth(now);
  const mesAnteriorInicio = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const umAnoAtras = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [
    { data: accounts },
    { data: cards },
    { data: categoriesData },
    { data: todasTransacoesEfetivadas },
    { data: transacoesRecentes },
    { data: budgetsRows },
    { data: goalsRows },
    { data: faturasAbertasCartoes },
    { data: despesasAgendadasMes },
  ] = await Promise.all([
    supabase
      .from("accounts")
      .select("id, nome, saldo_inicial, ativa")
      .eq("user_id", userId),
    supabase
      .from("credit_cards")
      .select("id, nome, ativo")
      .eq("user_id", userId),
    supabase
      .from("categories")
      .select("id, nome, cor"),
    // Busca todas as transações efetivadas para consistência com a página de Contas
    supabase
      .from("transactions")
      .select("id, tipo, valor, data, categoria_id, conta_id, account_id, conta_destino_id, cartao_id, forma_pagamento, status")
      .eq("user_id", userId)
      .eq("status", "efetivada"),
    supabase
      .from("transactions")
      .select("id, descricao, valor, tipo, data, categoria_id, conta_id, account_id, cartao_id, forma_pagamento")
      .eq("user_id", userId)
      .order("data", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("budgets")
      .select("valor_limite, categoria_id")
      .eq("user_id", userId)
      .gte("mes_referencia", toISODate(mesAtualInicio))
      .lt("mes_referencia", toISODate(mesAtualFim)),
    supabase
      .from("goals")
      .select("nome, valor_objetivo, valor_atual, prazo")
      .eq("user_id", userId)
      .eq("concluida", false),
    // Despesas de cartão de crédito não pagas (comprometem o saldo)
    supabase
      .from("transactions")
      .select("valor")
      .eq("user_id", userId)
      .eq("tipo", "despesa")
      .not("cartao_id", "is", null)
      .eq("status", "efetivada"),
    // Despesas agendadas no mês corrente
    supabase
      .from("transactions")
      .select("valor")
      .eq("user_id", userId)
      .eq("tipo", "despesa")
      .eq("status", "agendada")
      .gte("data", toISODate(mesAtualInicio))
      .lt("data", toISODate(mesAtualFim)),
  ]);

  const contasAtivas = (accounts ?? []).filter((a) => a.ativa !== false);
  const accountsMap = new Map((accounts ?? []).map((a) => [a.id, a.nome]));
  const cardsMap = new Map((cards ?? []).map((c) => [c.id, c.nome]));
  const categoriesMap = new Map(
    (categoriesData ?? []).map((c) => [c.id, { nome: c.nome, cor: c.cor || "#8A938F" }])
  );

  // 1. CÁLCULO EXATO DE SALDO ATUAL (Idêntico ao /contas)
  // Soma de saldo_inicial das contas ativas + saldo acumulado por conta
  const saldosPorConta = new Map<string, number>();
  for (const m of todasTransacoesEfetivadas ?? []) {
    const valor = Number(m.valor);
    const contaOrigem = (m.conta_id as string | undefined) || (m.account_id as string | undefined);
    const contaDestino = m.conta_destino_id as string | undefined;

    if (m.tipo === "receita" && contaOrigem) {
      saldosPorConta.set(contaOrigem, (saldosPorConta.get(contaOrigem) ?? 0) + valor);
    } else if (m.tipo === "despesa" && contaOrigem) {
      saldosPorConta.set(contaOrigem, (saldosPorConta.get(contaOrigem) ?? 0) - valor);
    } else if (m.tipo === "transferencia") {
      if (contaOrigem) {
        saldosPorConta.set(contaOrigem, (saldosPorConta.get(contaOrigem) ?? 0) - valor);
      }
      if (contaDestino) {
        saldosPorConta.set(contaDestino, (saldosPorConta.get(contaDestino) ?? 0) + valor);
      }
    }
  }

  const saldoAtual = contasAtivas.reduce(
    (sum, a) => sum + Number(a.saldo_inicial ?? 0) + (saldosPorConta.get(a.id) ?? 0),
    0
  );

  // 2. CÁLCULO DE SALDO COMPROMETIDO E DISPONÍVEL
  const faturaAbertaTotal = (faturasAbertasCartoes ?? []).reduce(
    (sum, t) => sum + Number(t.valor ?? 0),
    0
  );
  const agendadasMesTotal = (despesasAgendadasMes ?? []).reduce(
    (sum, t) => sum + Number(t.valor ?? 0),
    0
  );
  const saldoComprometido = faturaAbertaTotal + agendadasMesTotal;
  const saldoDisponivel = saldoAtual - saldoComprometido;

  // 3. RECEITAS E DESPESAS DO MÊS ATUAL E MÊS ANTERIOR
  const mesAtualInicioStr = toISODate(mesAtualInicio);
  const mesAtualFimStr = toISODate(mesAtualFim);
  const mesAnteriorInicioStr = toISODate(mesAnteriorInicio);

  const transacoesMesAtual = (todasTransacoesEfetivadas ?? []).filter(
    (t) => t.data >= mesAtualInicioStr && t.data < mesAtualFimStr
  );
  const transacoesMesAnterior = (todasTransacoesEfetivadas ?? []).filter(
    (t) => t.data >= mesAnteriorInicioStr && t.data < mesAtualInicioStr
  );

  const somaPorTipo = (rows: { tipo: string; valor: number }[], tipo: string) =>
    rows
      .filter((r) => r.tipo === tipo)
      .reduce((sum, r) => sum + Number(r.valor), 0);

  const receitasMes = somaPorTipo(transacoesMesAtual, "receita");
  const despesasMes = somaPorTipo(transacoesMesAtual, "despesa");
  const receitasMesAnterior = somaPorTipo(transacoesMesAnterior, "receita");
  const despesasMesAnterior = somaPorTipo(transacoesMesAnterior, "despesa");
  const economiaMes = receitasMes - despesasMes;

  // 4. GASTOS POR CATEGORIA (MÊS ATUAL)
  const gastosPorCategoriaMap = new Map<string, { valor: number; cor: string }>();
  transacoesMesAtual
    .filter((t) => t.tipo === "despesa")
    .forEach((t) => {
      const cat = t.categoria_id ? categoriesMap.get(t.categoria_id) : null;
      const nome = cat?.nome ?? "Outros";
      const cor = cat?.cor ?? "#8A938F";
      const atual = gastosPorCategoriaMap.get(nome);
      gastosPorCategoriaMap.set(nome, {
        valor: (atual?.valor ?? 0) + Number(t.valor),
        cor,
      });
    });

  const gastosPorCategoria = Array.from(gastosPorCategoriaMap.entries())
    .map(([categoria, v]) => ({ categoria, valor: v.valor, cor: v.cor }))
    .sort((a, b) => b.valor - a.valor);

  // 5. SÉRIES HISTÓRICAS DINÂMICAS POR PERÍODO (7D, 30D, 3M, 6M, 1A)
  const nomesMeses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  // Função auxiliar para formato ISO local (YYYY-MM-DD) sem distorção UTC
  const formatLocalISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 7 Dias (diário: ex: "28 Ago", "03 Set")
  const evolucao7D: EvolucaoPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dStr = formatLocalISODate(d);
    const label = `${String(d.getDate()).padStart(2, "0")} ${nomesMeses[d.getMonth()]}`;
    const transDia = (todasTransacoesEfetivadas ?? []).filter((t) => t.data === dStr);
    evolucao7D.push({
      mes: label,
      dataCompleta: dStr,
      receitas: somaPorTipo(transDia, "receita"),
      despesas: somaPorTipo(transDia, "despesa"),
    });
  }

  // 30 Dias (diário: ex: "05 Ago", "10 Ago")
  const evolucao30D: EvolucaoPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dStr = formatLocalISODate(d);
    const label = `${String(d.getDate()).padStart(2, "0")} ${nomesMeses[d.getMonth()]}`;
    const transDia = (todasTransacoesEfetivadas ?? []).filter((t) => t.data === dStr);
    evolucao30D.push({
      mes: label,
      dataCompleta: dStr,
      receitas: somaPorTipo(transDia, "receita"),
      despesas: somaPorTipo(transDia, "despesa"),
    });
  }

  // 3 Meses
  const evolucao3M: EvolucaoPoint[] = [];
  for (let i = 2; i >= 0; i--) {
    const mesRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const rows = (todasTransacoesEfetivadas ?? []).filter((r) => r.data?.startsWith(anoMes));
    evolucao3M.push({
      mes: nomesMeses[mesRef.getMonth()],
      receitas: somaPorTipo(rows, "receita"),
      despesas: somaPorTipo(rows, "despesa"),
    });
  }

  // 6 Meses
  const evolucao6M: EvolucaoPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const mesRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const rows = (todasTransacoesEfetivadas ?? []).filter((r) => r.data?.startsWith(anoMes));
    evolucao6M.push({
      mes: nomesMeses[mesRef.getMonth()],
      receitas: somaPorTipo(rows, "receita"),
      despesas: somaPorTipo(rows, "despesa"),
    });
  }

  // 1 Ano (12 meses)
  const evolucao1A: EvolucaoPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const mesRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const rows = (todasTransacoesEfetivadas ?? []).filter((r) => r.data?.startsWith(anoMes));
    evolucao1A.push({
      mes: nomesMeses[mesRef.getMonth()],
      receitas: somaPorTipo(rows, "receita"),
      despesas: somaPorTipo(rows, "despesa"),
    });
  }

  const evolucaoPorPeriodo: Record<ChartPeriod, EvolucaoPoint[]> = {
    "7D": evolucao7D,
    "30D": evolucao30D,
    "3M": evolucao3M,
    "6M": evolucao6M,
    "1A": evolucao1A,
  };

  return {
    summary: {
      saldoAtual,
      saldoComprometido,
      saldoDisponivel,
      saldoVariacaoPct: null, // Evita comparações fictícias de saldo total sem snapshot diário de patrimônio
      receitasMes,
      receitasVariacaoPct: pctChange(receitasMes, receitasMesAnterior),
      despesasMes,
      despesasVariacaoPct: pctChange(despesasMes, despesasMesAnterior),
      economiaMes,
      economiaPctRenda: receitasMes > 0 ? (economiaMes / receitasMes) * 100 : 0,
    },
    evolucao: evolucao6M,
    evolucaoPorPeriodo,
    gastosPorCategoria,
    transacoesRecentes: (transacoesRecentes ?? []).map((t) => {
      const cat = t.categoria_id ? categoriesMap.get(t.categoria_id) : null;
      const contaId =
        ((t as Record<string, unknown>).conta_id as string | undefined) ||
        ((t as Record<string, unknown>).account_id as string | undefined);
      const cartaoId = (t as Record<string, unknown>).cartao_id as string | undefined;
      const formaPagamento = (t as Record<string, unknown>).forma_pagamento as string | undefined;
      const contaOuCartaoNome =
        (contaId && accountsMap.get(contaId)) ||
        (cartaoId && cardsMap.get(cartaoId)) ||
        (formaPagamento ? formaPagamento.toUpperCase() : "—");

      return {
        id: t.id,
        descricao: t.descricao,
        categoria: cat?.nome ?? "Sem categoria",
        conta: contaOuCartaoNome,
        data: t.data,
        valor: Number(t.valor),
        tipo: t.tipo as "receita" | "despesa" | "transferencia",
      };
    }),
    orcamentos: (budgetsRows ?? []).map((b) => {
      const cat = b.categoria_id ? categoriesMap.get(b.categoria_id) : null;
      const nome = cat?.nome ?? "Sem categoria";
      const gastoCategoria = gastosPorCategoriaMap.get(nome)?.valor ?? 0;
      return { categoria: nome, limite: Number(b.valor_limite), gasto: gastoCategoria };
    }),
    metas: (goalsRows ?? []).map((g) => ({
      nome: g.nome,
      objetivo: Number(g.valor_objetivo),
      guardado: Number(g.valor_atual),
      prazo: g.prazo
        ? new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(
            new Date(g.prazo)
          )
        : "Sem prazo",
    })),
    temContas: (accounts ?? []).length > 0,
  };
}
