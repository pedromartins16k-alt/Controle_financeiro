use client;

import { useState } from react;
import { Download, FileText, PieChart as PieChartIcon, TrendingUp, Filter, Calendar } from lucide-react;
import { Card, CardHeader, CardTitle } from @/components/ui/card;
import { Button } from @/components/ui/button;
import { formatCurrency, formatDate } from @/lib/utils;
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from recharts;

interface ReportsViewProps {
  transactions: any[];
  categories: any[];
  accounts: any[];
  periodo: string;
}

export function ReportsView({
  transactions,
  categories,
  accounts,
  periodo,
}: ReportsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(periodo || mes);

  // Totais
  const totalReceitas = transactions
    .filter((t) => t.tipo === receita)
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const totalDespesas = transactions
    .filter((t) => t.tipo === despesa)
    .reduce((acc, t) => acc + Number(t.valor), 0);

  const saldoLiquido = totalReceitas - totalDespesas;
  const taxaPoupanca = totalReceitas > 0 ? ((totalReceitas - totalDespesas) / totalReceitas) * 100 : 0;

  // Gastos por categoria
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const expensesByCategory: Record<string, { nome: string; valor: number; cor: string }> = {};

  transactions
    .filter((t) => t.tipo === despesa)
    .forEach((t) => {
      const cat = t.categoria_id ? categoryMap.get(t.categoria_id) : null;
      const catNome = cat?.nome || Sem Categoria;
      const catCor = cat?.cor || #8A938F;
      if (!expensesByCategory[catNome]) {
        expensesByCategory[catNome] = { nome: catNome, valor: 0, cor: catCor };
      }
      expensesByCategory[catNome].valor += Number(t.valor);
    });

  const categoryChartData = Object.values(expensesByCategory).sort((a, b) => b.valor - a.valor);

  // Exportar CSV
  const handleExportCSV = () => {
    const headers = [Data, Descrição, Tipo, Categoria, Forma Pagamento, Valor (R$)];
    const rows = transactions.map((t) => [
      t.data,
      ",
 t.tipo,
 ,
 t.forma_pagamento || —,
 Number(t.valor).toFixed(2).replace(., ,),
 ]);

 const csvContent = data:text/csv;charset=utf-8,\uFEFF + [headers.join(;), ...rows.map((e) => e.join(;))].join(\n);
 const encodedUri = encodeURI(csvContent);
 const link = document.createElement(a);
 link.setAttribute(href, encodedUri);
 link.setAttribute(download, elatorio-financeiro-.csv);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 // Exportar / Imprimir PDF
 const handlePrintPDF = () => {
 window.print();
 };

 return (
 <div className=space-y-6>
 {/* Controles de Período e Exportação */}
 <div className=flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between>
 <div className=flex items-center gap-2>
 <span className=text-xs font-semibold uppercase text-text-muted>Período:</span>
 <div className=flex rounded-full bg-paper-raised p-1>
 {[
 { id: 7d, label: 7 Dias },
 { id: 30d, label: 30 Dias },
 { id: mes, label: Este Mês },
 { id: ano, label: Este Ano },
 { id: todos, label: Tudo },
 ].map((p) => (
 <a
 key={p.id}
 href={/relatorios?periodo=}
 className={ounded-full px-3 py-1.5 text-xs font-medium transition-colors }
 >
 {p.label}
 </a>
 ))}
 </div>
 </div>

 <div className=flex items-center gap-2>
 <Button variant=outline size=sm onClick={handleExportCSV} className=gap-1.5>
 <Download className=h-4 w-4 />
 Exportar CSV / Excel
 </Button>
 <Button variant=outline size=sm onClick={handlePrintPDF} className=gap-1.5>
 <FileText className=h-4 w-4 />
 Imprimir / Salvar PDF
 </Button>
 </div>
 </div>

 {/* Cards de Resumo */}
 <div className=grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4>
 <Card className=p-5>
 <span className=text-xs font-medium uppercase text-text-secondary>Total de Receitas</span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-income>
 + {formatCurrency(totalReceitas)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium uppercase text-text-secondary>Total de Despesas</span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-expense>
 - {formatCurrency(totalDespesas)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium uppercase text-text-secondary>Resultado Líquido</span>
 <p className={mt-2 text-2xl font-bold tracking-tight }>
 {formatCurrency(saldoLiquido)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium uppercase text-text-secondary>Taxa de Poupança</span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-text-primary>
 {taxaPoupanca.toFixed(1)}%
 </p>
 </Card>
 </div>

 {/* Gráfico de Despesas por Categoria */}
 <div className=grid grid-cols-1 gap-6 lg:grid-cols-2>
 <Card className=p-5>
 <CardHeader>
 <CardTitle className=text-base font-semibold text-text-primary>
 Despesas por Categoria
 </CardTitle>
 </CardHeader>
 {categoryChartData.length === 0 ? (
 <div className=flex h-64 items-center justify-center text-sm text-text-muted>
 Nenhuma despesa registrada no período selecionado.
 </div>
 ) : (
 <div className=h-64 w-full>
 <ResponsiveContainer width=100% height=100%>
 <PieChart>
 <Pie
 data={categoryChartData}
 dataKey=valor
 nameKey=nome
 cx=50%
 cy=50%
 outerRadius={80}
 innerRadius={45}
 paddingAngle={3}
 >
 {categoryChartData.map((entry, index) => (
 <Cell key={cell-} fill={entry.cor} />
 ))}
 </Pie>
 <Tooltip
 formatter={(value: any) => [formatCurrency(Number(value)), Valor]}
 />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 )}
 </Card>

 {/* Tabela de Maiores Despesas por Categoria */}
 <Card className=p-5>
 <CardHeader>
 <CardTitle className=text-base font-semibold text-text-primary>
 Detalhamento de Gastos
 </CardTitle>
 </CardHeader>
 <div className=space-y-3>
 {categoryChartData.map((c) => {
 const pct = totalDespesas > 0 ? (c.valor / totalDespesas) * 100 : 0;
 return (
 <div key={c.nome} className=flex items-center justify-between text-sm>
 <div className=flex items-center gap-2>
 <span
 className=h-3 w-3 rounded-full shrink-0
 style={{ backgroundColor: c.cor }}
 />
 <span className=font-medium text-text-primary>{c.nome}</span>
 </div>
 <div className=flex items-center gap-3>
 <span className=text-xs text-text-muted tabular-data>
 {pct.toFixed(1)}%
 </span>
 <span className=font-semibold text-text-primary tabular-data>
 {formatCurrency(c.valor)}
 </span>
 </div>
 </div>
 );
 })}
 {categoryChartData.length === 0 && (
 <p className=py-8 text-center text-sm text-text-muted>
 Sem dados para detalhar neste período.
 </p>
 )}
 </div>
 </Card>
 </div>

 {/* Tabela de Transações do Período */}
 <Card className=p-5>
 <CardHeader>
 <CardTitle className=text-base font-semibold text-text-primary>
 Extrato de Movimentações ({transactions.length})
 </CardTitle>
 </CardHeader>
 <div className=overflow-x-auto>
 <table className=w-full text-left text-sm>
 <thead>
 <tr className=border-b border-border text-xs uppercase text-text-muted>
 <th className=pb-3>Data</th>
 <th className=pb-3>Descrição</th>
 <th className=pb-3>Categoria</th>
 <th className=pb-3>Forma de Pagamento</th>
 <th className=pb-3 text-right>Valor</th>
 </tr>
 </thead>
 <tbody className=divide-y divide-border/60>
 {transactions.map((t) => {
 const cat = t.categoria_id ? categoryMap.get(t.categoria_id) : null;
 const isIncome = t.tipo === receita;
 return (
 <tr key={t.id} className=hover:bg-paper-raised/50>
 <td className=py-3 text-xs text-text-muted>{formatDate(t.data)}</td>
 <td className=py-3 font-medium text-text-primary>{t.descricao}</td>
 <td className=py-3 text-xs text-text-secondary>{cat?.nome || —}</td>
 <td className=py-3 text-xs capitalize text-text-secondary>{t.forma_pagamento || —}</td>
 <td className={py-3 text-right font-semibold tabular-data }>
 {isIncome ? + : -} {formatCurrency(t.valor)}
 </td>
 </tr>
 );
 })}
 {transactions.length === 0 && (
 <tr>
 <td colSpan={5} className=py-8 text-center text-sm text-text-muted>
 Nenhuma movimentação encontrada no período.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </Card>
 </div>
 );
}
