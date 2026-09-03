"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoriaGasto } from "@/lib/types";

const DEFAULT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#64748b"];

export function CategoryBreakdown({ data }: { data: CategoriaGasto[] }) {
  const total = data.reduce((sum, d) => sum + d.valor, 0);

  if (data.length === 0 || total === 0) {
    return (
      <Card className="p-4 md:p-6 border-border/80 bg-paper-raised">
        <CardHeader className="mb-2">
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Gastos por categoria
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">Distribuição do mês atual</p>
        </CardHeader>
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-sm text-text-secondary">
            Nenhuma despesa registrada este mês.
          </p>
          <p className="text-xs text-text-muted">
            Suas categorias e percentuais aparecem aqui ao registrar despesas.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 border-border/80 bg-paper-raised">
      <CardHeader className="mb-3">
        <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
          Maiores gastos por categoria
        </CardTitle>
        <p className="text-xs text-text-muted mt-0.5">Participação no total de despesas do mês</p>
      </CardHeader>

      <div className="relative h-48 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              nameKey="categoria"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={3}
              strokeWidth={1}
              stroke="rgba(0,0,0,0.2)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.categoria}
                  fill={entry.cor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
              contentStyle={{
                backgroundColor: "rgba(24, 30, 27, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 8,
                fontSize: 12,
                color: "#f8fafc",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="block font-display text-sm font-bold tabular-data text-text-primary">
            {formatCurrency(total)}
          </span>
          <span className="block text-[10px] text-text-muted uppercase tracking-wider">Total</span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 divide-y divide-border/40">
        {data.slice(0, 5).map((entry, index) => {
          const pct = total > 0 ? (entry.valor / total) * 100 : 0;
          const cor = entry.cor || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
          return (
            <li
              key={entry.categoria}
              className="flex items-center justify-between text-xs pt-1.5 first:pt-0"
            >
              <span className="flex items-center gap-2 text-text-secondary min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cor }}
                />
                <span className="font-medium truncate text-text-primary">{entry.categoria}</span>
                <span className="text-[10px] text-text-muted">({pct.toFixed(0)}%)</span>
              </span>
              <span className="tabular-data font-semibold text-text-primary shrink-0 pl-2">
                {formatCurrency(entry.valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
