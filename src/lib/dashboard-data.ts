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

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
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

  const [
    { data: accounts },
    { data: cards },
    { data: categoriesData },
    { data: transacoesMesAtual },
    { data: transacoesMesAnterior },
    { data: transacoesRecentes },
    { data: budgetsRows },
    { data: goalsRows },
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
  ]);

  const accountsMap = new Map((accounts ?? []).map((a) => [a.id, a.nome]));
  const cardsMap = new Map((cards ?? []).map((c) => [c.id, c.nome]));
  const categoriesMap = new Map(
    (categoriesData ?? []).map((c) => [c.id, { nome: c.nome, cor: c.cor || "#8A938F" }])
  );

  const saldoContas = (accounts ?? []).reduce(
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

  const saldoAtual = saldoContas + receitasMes - despesasMes;
  const saldoAnterior = saldoContas + receitasMesAnterior - despesasMesAnterior;

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

  const evolucaoMeses: DashboardData["evolucao"] = [];
  const nomesMeses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  for (let i = 5; i >= 0; i--) {
    const mesRef = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inicio = toISODate(mesRef);
    const fim = toISODate(new Date(mesRef.getFullYear(), mesRef.getMonth() + 1, 1));
    const { data: rows } = await supabase
      .from("transactions")
      .select("tipo, valor")
      .eq("user_id", userId)
      .gte("data", inicio)
      .lt("data", fim)
      .eq("status", "efetivada");
    evolucaoMeses.push({
      mes: nomesMeses[mesRef.getMonth()],
      receitas: somaPorTipo(rows, "receita"),
      despesas: somaPorTipo(rows, "despesa"),
    });
  }

  return {
    summary: {
      saldoAtual,
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
    transacoesRecentes: (transacoesRecentes ?? []).map((t: any) => {
      const cat = t.categoria_id ? categoriesMap.get(t.categoria_id) : null;
      const contaOuCartaoNome =
        (t.conta_id && accountsMap.get(t.conta_id)) ||
        (t.cartao_id && cardsMap.get(t.cartao_id)) ||
        (t.forma_pagamento ? t.forma_pagamento.toUpperCase() : "—");

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
