"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CategoriaGasto } from "@/lib/types";

const GLOW_COLORS = ["#818cf8", "#fb923c", "#34d399", "#f43f5e", "#38bdf8", "#fbbf24"];

export function CategoryBreakdown({ data }: { data: CategoriaGasto[] }) {
  const total = data.reduce((sum, d) => sum + d.valor, 0);

  if (data.length === 0) {
    return (
      <Card className="p-4 md:p-6">
        <CardHeader className="mb-2">
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Gastos por categoria
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <p className="text-sm text-text-secondary">
            Nenhuma despesa registrada este mês.
          </p>
          <p className="text-xs text-text-muted">
            Suas categorias aparecem aqui ao registrar lançamentos.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <CardHeader className="mb-2">
        <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
          Gastos por categoria
        </CardTitle>
      </CardHeader>

      <div className="relative h-52 w-full flex items-center justify-center">
        {/* Brilho Radial 3D no Centro */}
        <div className="pointer-events-none absolute h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl" />

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="valor"
              nameKey="categoria"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={3}
              strokeWidth={1}
              stroke="rgba(0,0,0,0.5)"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.categoria}
                  fill={entry.cor || GLOW_COLORS[index % GLOW_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), ""]}
              contentStyle={{
                background: "rgba(16, 24, 20, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 10,
                fontSize: 12,
                color: "#f0fdf4",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="rounded-full bg-black/40 border border-white/10 px-3 py-1.5 backdrop-blur-md text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="block font-display text-sm font-bold tabular-data text-white">
              {formatCurrency(total)}
            </span>
            <span className="block text-[10px] text-text-muted">total</span>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {data.map((entry, index) => (
          <li
            key={entry.categoria}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2 text-text-secondary">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{
                  backgroundColor: entry.cor || GLOW_COLORS[index % GLOW_COLORS.length],
                  color: entry.cor || GLOW_COLORS[index % GLOW_COLORS.length],
                }}
              />
              <span className="font-medium">{entry.categoria}</span>
            </span>
            <span className="tabular-data font-semibold text-text-primary">
              {formatCurrency(entry.valor)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
