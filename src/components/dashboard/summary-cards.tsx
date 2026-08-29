import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

function Delta({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-medium",
        positive ? "text-income" : "text-expense"
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-3.5 md:p-5">
        <CardHeader className="mb-1.5 flex items-center justify-between">
          <CardTitle className="text-xs font-medium md:text-sm">Saldo atual</CardTitle>
          <Delta pct={data.saldoVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="ledger-underline pb-1 font-display text-xl font-semibold tabular-data md:text-3xl">
            {formatCurrency(data.saldoAtual)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card className="p-3.5 md:p-5">
        <CardHeader className="mb-1.5 flex items-center justify-between">
          <CardTitle className="text-xs font-medium md:text-sm">Receitas do mês</CardTitle>
          <Delta pct={data.receitasVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-semibold tabular-data text-income md:text-3xl">
            {formatCurrency(data.receitasMes)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card className="p-3.5 md:p-5">
        <CardHeader className="mb-1.5 flex items-center justify-between">
          <CardTitle className="text-xs font-medium md:text-sm">Despesas do mês</CardTitle>
          <Delta pct={data.despesasVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-semibold tabular-data text-expense md:text-3xl">
            {formatCurrency(data.despesasMes)}
          </p>
          <p className="mt-1 text-[10px] text-text-muted md:text-xs">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card className="p-3.5 md:p-5">
        <CardHeader className="mb-1.5 flex items-center justify-between">
          <CardTitle className="text-xs font-medium md:text-sm">Economia do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="pb-1 font-display text-xl font-semibold tabular-data md:text-3xl">
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
