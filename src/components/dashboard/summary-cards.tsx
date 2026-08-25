import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

function Delta({ pct }: { pct: number }) {
  const positive = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        positive ? "text-income" : "text-expense"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function SummaryCards({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Saldo atual</CardTitle>
          <Delta pct={data.saldoVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="ledger-underline pb-2 font-display text-3xl font-medium tabular-data">
            {formatCurrency(data.saldoAtual)}
          </p>
          <p className="mt-2 text-xs text-text-muted">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receitas do mês</CardTitle>
          <Delta pct={data.receitasVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-2 font-display text-3xl font-medium tabular-data text-income">
            {formatCurrency(data.receitasMes)}
          </p>
          <p className="mt-2 text-xs text-text-muted">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Despesas do mês</CardTitle>
          <Delta pct={data.despesasVariacaoPct} />
        </CardHeader>
        <CardContent>
          <p className="pb-2 font-display text-3xl font-medium tabular-data text-expense">
            {formatCurrency(data.despesasMes)}
          </p>
          <p className="mt-2 text-xs text-text-muted">vs. mês anterior</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Economia do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="pb-2 font-display text-3xl font-medium tabular-data">
            {formatCurrency(data.economiaMes)}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {data.economiaPctRenda.toFixed(0)}% da renda economizada
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
