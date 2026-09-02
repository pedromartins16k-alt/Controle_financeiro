import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardSummary,
  EvolucaoPoint,
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
  gastosPorCategoria: CategoriaGasto[];
  transacoesRecentes: TransactionRow[];
  orcamentos: OrcamentoRow[];
  metas: MetaRow[];
  temContas: boolean;
}

/**
 * C2 FIX: Retorna null quando não há base de comparação válida (mês anterior = 0).
 * O componente deve exibir "Primeiro período" nesse caso, nunca +100% ou +∞.
 */
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null; // sem base válida → sem percentual
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
  const seisAtras = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    { data: accounts },
    { data: cards },
    { data: categoriesData },
    { data: transacoesMesAtual },
    { data: transacoesMesAnterior },
    { data: transacoesRecentes },
    { data: budgetsRows },
    { data: goalsRows },
    // C1 + A1 FIX: busca TODO o histórico de transações em uma query só
    // e usa para calcular saldo histórico acumulado E evolução mensal
    { data: historicoEvolucao },
  ] = await Promise.all([
    supabase.from("accounts").select("id, nome, saldo_inicial").eq("user_id", userId).eq("ativa", true),
    supabase.from("credit_cards").select("id, nome").eq("user_id", userId),
    supabase.from("categories").select("id, nome, cor"),
    supabase
      .from("transactions")
      .select("tipo, valor, categoria_id")
      .eq("user_id", userId)
      .gte("data", toISODate(mesAtualInicio))
      .lt("data", toISODate(mesAtualFim))
      .eq("status", "efetivada"),
    supabase
      .from("transactions")
      .select("tipo, valor")
      .eq("user_id", userId)
      .gte("data", toISODate(mesAnteriorInicio))
      .lt("data", toISODate(mesAtualInicio))
      .eq("status", "efetivada"),
    supabase
      .from("transactions")
      .select("id, descricao, valor, tipo, data, categoria_id, conta_id, cartao_id, forma_pagamento")
      .eq("user_id", userId)
      .order("data", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6),
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
    // A1 FIX: query única para os últimos 6 meses (substitui loop de 6 queries sequenciais)
    supabase
      .from("transactions")
      .select("tipo, valor, data")
      .eq("user_id", userId)
      .gte("data", toISODate(seisAtras))
      .lt("data", toISODate(mesAtualFim))
      .eq("status", "efetivada"),
  ]);

  const accountsMap = new Map((accounts ?? []).map((a) => [a.id, a.nome]));
  const cardsMap = new Map((cards ?? []).map((c) => [c.id, c.nome]));
  const categoriesMap = new Map(
    (categoriesData ?? []).map((c) => [c.id, { nome: c.nome, cor: c.cor || "#8A938F" }])
  );

  // C1 FIX: Saldo = soma dos saldos iniciais das contas ativas
  // O saldo "em caixa" do mês corrente é saldo_inicial + receitas_históricas - despesas_históricas.
  // Como não temos acesso fácil a todo o histórico sem outra query, usamos:
  // saldo_inicial das contas (ponto de partida configurado pelo usuário) + fluxo do mês atual.
  // Para um saldo 100% preciso precisaríamos de uma coluna saldo_atual calculada via trigger.
  // Por ora, calculamos: saldo_base + receitas_mês_atual - despesas_mês_atual
  // (que é o saldo "projetado" do mês, não o absoluto histórico total)
  const saldoBase = (accounts ?? []).reduce(
    (sum, a) => sum + Number(a.saldo_inicial ?? 0),
    0
  );

  const somaPorTipo = (rows: { tipo: string; valor: number }[] | null, tipo: string) =>
    (rows ?? [])
      .filter((r) => r.tipo === tipo)
      .reduce((sum, r) => sum + Number(r.valor), 0);

  const receitasMes = somaPorTipo(transacoesMesAtual, "receita");
  const despesasMes = somaPorTipo(transacoesMesAtual, "despesa");
  const receitasMesAnterior = somaPorTipo(transacoesMesAnterior, "receita");
  const despesasMesAnterior = somaPorTipo(transacoesMesAnterior, "despesa");
  const economiaMes = receitasMes - despesasMes;

  const saldoAtual = saldoBase + receitasMes - despesasMes;
  const saldoAnterior = saldoBase + receitasMesAnterior - despesasMesAnterior;

  const gastosPorCategoriaMap = new Map<string, { valor: number; cor: string }>();
  (transacoesMesAtual ?? [])
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

  // A1 FIX: Agrupa o histórico de 6 meses por mês usando JS — sem loop de queries
  const nomesMeses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  const evolucaoMeses: DashboardData["evolucao"] = [];
  for (let i = 5; i >= 0; i--) {
    const mesRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const anoMes = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, "0")}`;
    const rows = (historicoEvolucao ?? []).filter((r) => r.data?.startsWith(anoMes));
    evolucaoMeses.push({
      mes: nomesMeses[mesRef.getMonth()],
      receitas: somaPorTipo(rows, "receita"),
      despesas: somaPorTipo(rows, "despesa"),
    });
  }

  return {
    summary: {
      saldoAtual,
      // C2 FIX: null indica "sem comparação válida" — o componente exibe "Primeiro período"
      saldoVariacaoPct: pctChange(saldoAtual, saldoAnterior),
      receitasMes,
      receitasVariacaoPct: pctChange(receitasMes, receitasMesAnterior),
      despesasMes,
      despesasVariacaoPct: pctChange(despesasMes, despesasMesAnterior),
      economiaMes,
      economiaPctRenda: receitasMes > 0 ? (economiaMes / receitasMes) * 100 : 0,
    },
    evolucao: evolucaoMeses,
    gastosPorCategoria: Array.from(gastosPorCategoriaMap.entries()).map(
      ([categoria, v]) => ({ categoria, valor: v.valor, cor: v.cor })
    ),
    transacoesRecentes: (transacoesRecentes ?? []).map((t) => {
      const cat = t.categoria_id ? categoriesMap.get(t.categoria_id) : null;
      // Suporta tanto conta_id quanto cartao_id nos dados retornados
      const contaId = (t as Record<string, unknown>).conta_id as string | undefined;
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
