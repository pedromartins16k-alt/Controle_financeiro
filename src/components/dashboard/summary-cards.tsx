import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

function Delta({ pct, invert = false }: { pct: number; invert?: boolean }) {
  const positive = pct >= 0;
  const isGood = invert ? !positive : positive;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-md border",
        isGood
          ? "text-emerald-400 bg-emerald-950/50 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
          : "text-rose-400 bg-rose-950/50 border-rose-500/25 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3 strokeWidth={2.5}" />
      ) : (
        <ArrowDownRight className="h-3 w-3 strokeWidth={2.5}" />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function SummaryCards({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* Saldo Atual */}
      <Card className="p-4 md:p-5">
        <CardHeader className="mb-2 flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-text-secondary md:text-sm">
            Saldo atual
          </CardTitle>
          <Delta pct={data.saldoVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-bold tabular-data md:text-3xl neon-glow-green">
            {formatCurrency(data.saldoAtual)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      {/* Receitas do Mês */}
      <Card className="p-4 md:p-5">
        <CardHeader className="mb-2 flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-text-secondary md:text-sm">
            Receitas do mês
          </CardTitle>
          <Delta pct={data.receitasVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-bold tabular-data md:text-3xl neon-glow-green">
            {formatCurrency(data.receitasMes)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      {/* Despesas do Mês */}
      <Card className="p-4 md:p-5">
        <CardHeader className="mb-2 flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-text-secondary md:text-sm">
            Despesas do mês
          </CardTitle>
          <Delta pct={data.despesasVariacaoPct} invert />
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-bold tabular-data md:text-3xl neon-glow-red">
            {formatCurrency(data.despesasMes)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      {/* Economia do Mês */}
      <Card className="p-4 md:p-5">
        <CardHeader className="mb-2 flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-text-secondary md:text-sm">
            Economia do mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={cn(
            "pb-1 font-display text-xl font-bold tabular-data md:text-3xl",
            data.economiaMes >= 0 ? "neon-glow-white" : "neon-glow-red"
          )}>
            {formatCurrency(data.economiaMes)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">
            {data.economiaPctRenda.toFixed(0)}% da renda
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
