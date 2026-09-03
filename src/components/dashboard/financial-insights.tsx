import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
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

  // Insight 1: Taxa de Poupança / Economia (Apenas se houver receitas reais registradas)
  if (summary.receitasMes > 0) {
    if (summary.economiaPctRenda >= 20) {
      insights.push({
        id: "taxa-poupanca-alta",
        type: "positive",
        title: "Excelente taxa de poupança",
        description: `Você guardou ${summary.economiaPctRenda.toFixed(0)}% da sua renda este mês (${formatCurrency(summary.economiaMes)} poupados). Parabéns pelo controle!`,
      });
    } else if (summary.economiaPctRenda > 0) {
      insights.push({
        id: "taxa-poupanca-moderada",
        type: "info",
        title: "Poupança em andamento",
        description: `Você economizou ${summary.economiaPctRenda.toFixed(0)}% da sua renda. A meta padrão de saúde financeira é tentar poupar ao menos 20%.`,
      });
    } else {
      insights.push({
        id: "gastos-acima-receitas",
        type: "warning",
        title: "Atenção: Despesas superando receitas",
        description: `Seus gastos este mês superaram suas entradas em ${formatCurrency(Math.abs(summary.economiaMes))}. Fique atento para evitar juros.`,
      });
    }
  }

  // Insight 2: Concentração de Gastos por Categoria
  if (categorias.length > 0 && summary.despesasMes > 0) {
    const topCat = categorias[0]; // Já ordenado pelo backend
    const pctDoTotal = Math.round((topCat.valor / summary.despesasMes) * 100);
    if (pctDoTotal >= 30) {
      insights.push({
        id: "top-categoria",
        type: "info",
        title: `Maior foco de gastos: ${topCat.categoria}`,
        description: `Esta categoria concentra ${pctDoTotal}% de todas as suas despesas do mês (${formatCurrency(topCat.valor)}).`,
      });
    }
  }

  // Insight 3: Orçamentos em Alerta ou Estourados
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
        title: `${estourados.length} teto(s) de gasto ultrapassado(s)`,
        description: `Você excedeu o limite estipulado em: ${estourados.map((o) => o.categoria).join(", ")}.`,
      });
    } else {
      insights.push({
        id: "orcamento-atencao",
        type: "warning",
        title: "Orçamentos próximos do limite",
        description: `Atenção aos tetos de: ${orcamentosAlerta.map((o) => o.categoria).join(", ")} (mais de 80% consumido).`,
      });
    }
  }

  // Insight 4: Saldo Comprometido Alto em Relação ao Saldo Total
  if (summary.saldoAtual > 0 && summary.saldoComprometido > 0) {
    const pctComprometido = (summary.saldoComprometido / summary.saldoAtual) * 100;
    if (pctComprometido >= 50 && summary.saldoDisponivel >= 0) {
      insights.push({
        id: "comprometimento-alto",
        type: "warning",
        title: "Alto comprometimento de saldo",
        description: `${pctComprometido.toFixed(0)}% do seu saldo atual em contas está reservado para faturas e despesas do mês.`,
      });
    } else if (summary.saldoDisponivel < 0) {
      insights.push({
        id: "saldo-negativo-projetado",
        type: "warning",
        title: "Compromissos superam saldo em conta",
        description: `Seus cartões e contas agendadas (${formatCurrency(summary.saldoComprometido)}) superam o saldo atual em ${formatCurrency(Math.abs(summary.saldoDisponivel))}.`,
      });
    }
  }

  return (
    <div className="rounded-xl border border-border/80 bg-paper-raised p-4 md:p-5 shadow-xs">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary md:text-base">
              Insights financeiros
            </h3>
            <p className="text-[11px] text-text-muted">
              Diagnósticos gerados a partir do seu comportamento de gastos e saldo real
            </p>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-paper/50 p-3.5 text-xs text-text-muted">
          <HelpCircle className="h-4 w-4 shrink-0 text-text-muted" />
          <span>
            Você ainda não possui movimentações suficientes para gerar diagnósticos estatísticos este mês. Continue registrando suas despesas e receitas.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-lg border p-3.5 text-xs transition-colors ${
                item.type === "positive"
                  ? "border-emerald-500/20 bg-emerald-500/[0.04] text-text-primary"
                  : item.type === "warning"
                  ? "border-amber-500/20 bg-amber-500/[0.04] text-text-primary"
                  : "border-border bg-paper/60 text-text-primary"
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
      )}
    </div>
  );
}
