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
    <div className="glass-card-3d rounded-2xl p-5 border-white/[0.08] relative overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-text-primary md:text-base tracking-tight">
              Diagnósticos & Insights Inteligentes
            </h3>
            <p className="text-xs text-text-secondary">
              Análise em tempo real do seu comportamento financeiro e projeção de liquidez
            </p>
          </div>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-xs text-text-secondary">
          <HelpCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            Você ainda não possui movimentações suficientes para gerar diagnósticos estatísticos este mês. Continue registrando suas despesas e receitas para liberar análises preditivas.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl border p-4 text-xs transition-all ${
                item.type === "positive"
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-text-primary hover:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                  : item.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/[0.06] text-text-primary hover:border-amber-500/50"
                  : "border-white/[0.08] bg-black/30 text-text-primary hover:border-sky-500/30"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-semibold text-text-primary mb-1.5">
                  {item.type === "positive" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                  {item.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                  {item.type === "info" && <TrendingUp className="h-4 w-4 text-sky-400 shrink-0" />}
                  <span className="text-xs font-bold tracking-tight">{item.title}</span>
                </div>
                <p className="text-text-secondary text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
