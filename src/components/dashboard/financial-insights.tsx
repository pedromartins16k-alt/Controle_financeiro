import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary, CategoriaGasto, OrcamentoRow } from "@/lib/types";

interface FinancialInsightsProps {
  summary: DashboardSummary;
  categorias: CategoriaGasto[];
  orcamentos: OrcamentoRow[];
}

export function FinancialInsights({ summary, categorias, orcamentos }: FinancialInsightsProps) {
  const insights: Array<{
    id: string;
    type: "positive" | "warning" | "info";
    title: string;
    description: string;
  }> = [];

  // Insight 1: Taxa de Poupança / Economia
  if (summary.receitasMes > 0) {
    if (summary.economiaPctRenda >= 20) {
      insights.push({
        id: "taxa-poupanca-alta",
        type: "positive",
        title: "Excelente taxa de poupança",
        description: `Você economizou ${summary.economiaPctRenda.toFixed(0)}% da sua renda este mês (${formatCurrency(summary.economiaMes)} guardados). Continue assim!`,
      });
    } else if (summary.economiaPctRenda > 0) {
      insights.push({
        id: "taxa-poupanca-moderada",
        type: "info",
        title: "Poupança em andamento",
        description: `Você economizou ${summary.economiaPctRenda.toFixed(0)}% da sua renda. A recomendação dos especialistas é tentar reservar pelo menos 20%.`,
      });
    } else {
      insights.push({
        id: "gastos-acima-receitas",
        type: "warning",
        title: "Atenção: Despesas superando receitas",
        description: `Seus gastos este mês superaram suas entradas em ${formatCurrency(Math.abs(summary.economiaMes))}. Vale revisar os lançamentos para não entrar no vermelho.`,
      });
    }
  }

  // Insight 2: Maior Categoria de Gasto
  if (categorias.length > 0 && summary.despesasMes > 0) {
    const topCat = [...categorias].sort((a, b) => b.valor - a.valor)[0];
    const pctDoTotal = Math.round((topCat.valor / summary.despesasMes) * 100);
    if (pctDoTotal >= 30) {
      insights.push({
        id: "top-categoria",
        type: "info",
        title: `Maior foco de gasto: ${topCat.categoria}`,
        description: `Representa ${pctDoTotal}% de todas as suas despesas do mês (${formatCurrency(topCat.valor)}).`,
      });
    }
  }

  // Insight 3: Orçamentos em Alerta
  const orcamentosAlerta = orcamentos.filter((o) => {
    const pct = o.limite > 0 ? (o.gasto / o.limite) * 100 : 0;
    return pct >= 80;
  });

  if (orcamentosAlerta.length > 0) {
    const estourados = orcamentosAlerta.filter((o) => o.gasto > o.limite);
    if (estourados.length > 0) {
      insights.push({
        id: "orcamento-estourado",
        type: "warning",
        title: `${estourados.length} orçamento(s) excedido(s)`,
        description: `Você ultrapassou o teto estipulado em: ${estourados.map((o) => o.categoria).join(", ")}.`,
      });
    } else {
      insights.push({
        id: "orcamento-atencao",
        type: "warning",
        title: "Orçamentos próximos do limite",
        description: `Atenção aos tetos de: ${orcamentosAlerta.map((o) => o.categoria).join(", ")} (já consumiram mais de 80%).`,
      });
    }
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/80 bg-paper-raised p-4 md:p-5 shadow-sm">
      <div className="mb-3.5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand dark:bg-emerald-950/60 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="font-display text-sm font-semibold text-text-primary md:text-base">
          Insights financeiros inteligentes
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col justify-between rounded-lg border p-3 text-xs md:text-sm transition-colors ${
              item.type === "positive"
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-950 dark:text-emerald-200"
                : item.type === "warning"
                ? "border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-200"
                : "border-border bg-paper/60 text-text-secondary"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-text-primary mb-1">
                {item.type === "positive" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                {item.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                {item.type === "info" && <TrendingUp className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                <span>{item.title}</span>
              </div>
              <p className="text-text-muted leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
