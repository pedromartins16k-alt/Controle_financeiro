export interface DashboardSummary {
  saldoAtual: number;
  /** null = sem comparação válida (mês anterior zerado → exibe "Primeiro período") */
  saldoVariacaoPct: number | null;
  receitasMes: number;
  /** null = sem comparação válida */
  receitasVariacaoPct: number | null;
  despesasMes: number;
  /** null = sem comparação válida */
  despesasVariacaoPct: number | null;
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
  is_recorrente?: boolean;
  intervalo_recorrencia?: "mensal" | "semanal" | "anual" | null;
  parcela_atual?: number | null;
  total_parcelas?: number | null;
  grupo_id?: string | null;
}

export interface CategoryRow {
  id: string;
  nome: string;
  icone?: string;
  cor: string;
  tipo?: "receita" | "despesa" | "ambos";
  user_id?: string | null;
}

export interface OrcamentoRow {
  categoria: string;
  limite: number;
  gasto: number;
}

export interface DetailedBudgetRow {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaCor: string;
  categoriaIcone?: string;
  mesReferencia: string;
  valorLimite: number;
  valorGasto: number;
  percentualGasto: number;
}

export interface MetaRow {
  nome: string;
  objetivo: number;
  guardado: number;
  prazo: string;
}

export interface DetailedGoalRow {
  id: string;
  nome: string;
  descricao?: string | null;
  valorObjetivo: number;
  valorAtual: number;
  prazo?: string | null;
  cor: string;
  icone?: string | null;
  concluida: boolean;
  percentual: number;
  valorRestante: number;
  sugestaoMensal?: number | null;
}

export interface NotificationRow {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "alerta" | "info" | "sucesso" | "vencimento";
  lida: boolean;
  link?: string | null;
  data: string;
}

export interface AccountRow {
  id: string;
  nome: string;
  tipo: "corrente" | "poupanca" | "dinheiro" | "carteira_digital" | "investimento" | "outros";
  banco: string | null;
  saldoInicial: number;
  saldoAtual: number;
  icone: string;
  cor: string;
  ativa: boolean;
}

export interface CreditCardRow {
  id: string;
  nome: string;
  banco: string | null;
  limite: number;
  limiteDisponivel: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
  ultimosDigitos: string | null;
  ativo: boolean;
  faturaAtual: number;
  statusFatura: "aberta" | "fechada" | "paga" | "atrasada";
  dataFechamentoFormatada: string;
  dataVencimentoFormatada: string;
  diasAteVencimento: number;
}

export interface InvoiceRow {
  id: string;
  cartaoId: string;
  mesReferencia: string;
  valorTotal: number;
  status: "aberta" | "fechada" | "paga" | "atrasada";
  dataFechamento: string;
  dataVencimento: string;
}
