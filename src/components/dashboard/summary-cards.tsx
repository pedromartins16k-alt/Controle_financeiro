import { ArrowDownRight, ArrowUpRight, Minus, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

/**
 * Exibe variação percentual válida, ou "Primeiro período registrado" / "Sem comparação" se não houver base.
 * Nunca mostra percentuais matematicamente absurdos.
 */
function Delta({
  pct,
  invert = false,
  emptyLabel = "Sem comparação",
}: {
  pct: number | null;
  invert?: boolean;
  emptyLabel?: string;
}) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border border-border text-text-muted bg-paper/60">
        <Minus className="h-2.5 w-2.5" strokeWidth={2} />
        {emptyLabel}
      </span>
    );
  }

  const positive = pct >= 0;
  const isGood = invert ? !positive : positive;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border",
        isGood
          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
      ) : (
        <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function SummaryCards({ data }: { data: DashboardSummary }) {
  const getVariationText = (pct: number | null) => {
    if (pct === null) return "Ainda não há histórico suficiente para comparação";
    const positive = pct >= 0;
    const value = Math.abs(pct).toFixed(1);
    return positive ? `↑ ${value}% maior que o mês anterior` : `↓ ${value}% menor que o mês anterior`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Bloco de Saldo: Atual, Comprometido e Disponível */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Saldo Atual */}
        <Card className="p-4 md:p-5">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Saldo em contas
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Contas ativas
            </span>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "pb-1 font-display text-2xl font-bold tabular-data md:text-3xl",
                data.saldoAtual >= 0 ? "text-text-primary" : "text-rose-500"
              )}
            >
              {formatCurrency(data.saldoAtual)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Dinheiro efetivamente disponível nas contas
            </p>
          </CardContent>
        </Card>

        {/* Saldo Comprometido */}
        <Card className="p-4 md:p-5">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Saldo comprometido
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
              <CreditCard className="h-3.5 w-3.5" />
              Faturas e pagamentos agendados
            </span>
          </CardHeader>
          <CardContent>
            <p className="pb-1 font-display text-2xl font-bold tabular-data md:text-3xl text-amber-600 dark:text-amber-400">
              {formatCurrency(data.saldoComprometido)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {data.saldoComprometido > 0
                ? "Compromissos financeiros futuros no período"
                : "Nenhum compromisso pendente"}
            </p>
          </CardContent>
        </Card>

        {/* Saldo Livre Real */}
        <Card className="p-4 md:p-5 border-emerald-500/30 bg-emerald-950/25">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Saldo livre real
            </CardTitle>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Lock className="h-3 w-3" />
              Livre de compromissos
            </span>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "pb-1 font-display text-2xl font-bold tabular-data md:text-3xl",
                data.saldoDisponivel >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-500/90 dark:text-rose-400/90"
              )}
            >
              {formatCurrency(data.saldoDisponivel)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Cálculo: Saldo disponível - Compromissos pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Bloco de Performance do Mês: Receitas, Despesas e Economia */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Receitas do Mês */}
        <Card className="p-4 md:p-5">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Receitas do mês
            </CardTitle>
            <Delta pct={data.receitasVariacaoPct} />
          </CardHeader>
          <CardContent>
            <p className="pb-1 font-display text-xl font-bold tabular-data md:text-2xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.receitasMes)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {getVariationText(data.receitasVariacaoPct)}
            </p>
          </CardContent>
        </Card>

        {/* Despesas do Mês */}
        <Card className="p-4 md:p-5">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Despesas do mês
            </CardTitle>
            <Delta pct={data.despesasVariacaoPct} invert />
          </CardHeader>
          <CardContent>
            <p className="pb-1 font-display text-xl font-bold tabular-data md:text-2xl text-rose-600 dark:text-rose-400">
              {formatCurrency(data.despesasMes)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {getVariationText(data.despesasVariacaoPct)}
            </p>
          </CardContent>
        </Card>

        {/* Economia do Mês */}
        <Card className="p-4 md:p-5">
          <CardHeader className="mb-2 flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Economia do mês
            </CardTitle>
            {data.receitasMes > 0 && (
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                  data.economiaMes >= 0
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
                )}
              >
                Taxa de economia: {data.economiaPctRenda.toFixed(0)}%
              </span>
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "pb-1 font-display text-xl font-bold tabular-data md:text-2xl",
                data.economiaMes >= 0 ? "text-text-primary" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatCurrency(data.economiaMes)}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              {data.receitasMes > 0
                ? data.economiaMes >= 0
                  ? "Saldo positivo economizado este mês"
                  : "Gastos excederam as receitas"
                : "Sem receitas registradas este mês"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
