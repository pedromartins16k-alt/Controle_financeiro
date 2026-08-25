// Dados de exemplo — Etapa 1 (layout). Serão substituídos por consultas
// reais ao Supabase (tabelas transactions, accounts, budgets, goals) na Etapa 2.

export const summary = {
  saldoAtual: 4820.45,
  saldoVariacaoPct: 6.2,
  receitasMes: 6200.0,
  receitasVariacaoPct: 2.1,
  despesasMes: 3910.3,
  despesasVariacaoPct: -4.5,
  economiaMes: 2289.7,
  economiaPctRenda: 36.9,
};

export const evolucao = [
  { mes: "Mar", receitas: 5800, despesas: 4200 },
  { mes: "Abr", receitas: 5950, despesas: 3800 },
  { mes: "Mai", receitas: 6100, despesas: 4400 },
  { mes: "Jun", receitas: 5900, despesas: 3600 },
  { mes: "Jul", receitas: 6050, despesas: 4090 },
  { mes: "Ago", receitas: 6200, despesas: 3910 },
];

export const gastosPorCategoria = [
  { categoria: "Moradia", valor: 1400, cor: "#17594A" },
  { categoria: "Alimentação", valor: 890, cor: "#2F9E6E" },
  { categoria: "Transporte", valor: 520, cor: "#3E5C8A" },
  { categoria: "Lazer", valor: 410, cor: "#C98A2C" },
  { categoria: "Saúde", valor: 380, cor: "#C4432B" },
  { categoria: "Outros", valor: 310, cor: "#8A938F" },
];

export const transacoesRecentes = [
  {
    id: "1",
    descricao: "Salário",
    categoria: "Renda",
    conta: "Nubank",
    data: "2026-08-20",
    valor: 6200.0,
    tipo: "receita" as const,
  },
  {
    id: "2",
    descricao: "Supermercado Extra",
    categoria: "Alimentação",
    conta: "Cartão Inter",
    data: "2026-08-22",
    valor: 250.0,
    tipo: "despesa" as const,
  },
  {
    id: "3",
    descricao: "Netflix",
    categoria: "Assinaturas",
    conta: "Cartão Inter",
    data: "2026-08-21",
    valor: 39.9,
    tipo: "despesa" as const,
  },
  {
    id: "4",
    descricao: "Uber",
    categoria: "Transporte",
    conta: "Nubank",
    data: "2026-08-19",
    valor: 32.5,
    tipo: "despesa" as const,
  },
  {
    id: "5",
    descricao: "Freelance design",
    categoria: "Renda extra",
    conta: "Mercado Pago",
    data: "2026-08-18",
    valor: 480.0,
    tipo: "receita" as const,
  },
];

export const orcamentos = [
  { categoria: "Alimentação", limite: 800, gasto: 620 },
  { categoria: "Transporte", limite: 400, gasto: 320 },
  { categoria: "Lazer", limite: 300, gasto: 410 },
];

export const metas = [
  { nome: "Comprar notebook", objetivo: 5000, guardado: 2300, prazo: "Dez/2026" },
  { nome: "Reserva de emergência", objetivo: 12000, guardado: 7400, prazo: "Jun/2027" },
];
