"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoriaGasto } from "@/lib/types";

export function CategoryBreakdown({ data }: { data: CategoriaGasto[] }) {
  const total = data.reduce((sum, d) => sum + d.valor, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-primary">
            Gastos por categoria
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-sm text-text-secondary">
            Nenhuma despesa registrada este mês.
          </p>
          <p className="text-xs text-text-muted">
            Suas categorias de gastos aparecem aqui assim que você adicionar despesas.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-primary">
          Gastos por categoria
        </CardTitle>
      </CardHeader>

      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              nameKey="categoria"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.categoria} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-medium tabular-data">
            {formatCurrency(total)}
          </span>
          <span className="text-xs text-text-muted">total</span>
        </div>
      </div>

      <ul className="mt-2 space-y-2">
        {data.map((entry) => (
          <li key={entry.categoria} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.cor }}
              />
              {entry.categoria}
            </span>
            <span className="tabular-data text-text-primary">
              {formatCurrency(entry.valor)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
