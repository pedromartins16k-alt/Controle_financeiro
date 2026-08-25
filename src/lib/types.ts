export interface DashboardSummary {
  saldoAtual: number;
  saldoVariacaoPct: number;
  receitasMes: number;
  receitasVariacaoPct: number;
  despesasMes: number;
  despesasVariacaoPct: number;
  economiaMes: number;
  economiaPctRenda: number;
}

export interface EvolucaoPoint {
  mes: string;
  receitas: number;
  despesas: number;
}

export interface CategoriaGasto {
  categoria: string;
  valor: number;
  cor: string;
}

export interface TransactionRow {
  id: string;
  descricao: string;
  categoria: string;
  conta: string;
  data: string;
  valor: number;
  tipo: "receita" | "despesa" | "transferencia";
}

export interface OrcamentoRow {
  categoria: string;
  limite: number;
  gasto: number;
}

export interface MetaRow {
  nome: string;
  objetivo: number;
  guardado: number;
  prazo: string;
}
