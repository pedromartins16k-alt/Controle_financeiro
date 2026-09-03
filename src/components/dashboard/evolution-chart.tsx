"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { EvolucaoPoint, ChartPeriod } from "@/lib/types";

const PERIODS: { label: string; value: ChartPeriod }[] = [
  { label: "7D", value: "7D" },
  { label: "30D", value: "30D" },
  { label: "6M", value: "6M" },
  { label: "1A", value: "1A" },
];

interface EvolutionChartProps {
  data?: EvolucaoPoint[];
  dataByPeriod?: Record<ChartPeriod, EvolucaoPoint[]>;
}

export function EvolutionChart({ data = [], dataByPeriod }: EvolutionChartProps) {
  const [period, setPeriod] = React.useState<ChartPeriod>("6M");

  const currentData = dataByPeriod ? dataByPeriod[period] ?? data : data;
  const hasData = currentData.some((p) => p.receitas > 0 || p.despesas > 0);

  // No período 30D, exibe ticks espaçados para não sobrepor labels diárias no mobile/desktop
  const xAxisInterval = period === "30D" ? 4 : 0;

  return (
    <Card className="col-span-1 p-4 xl:col-span-2 md:p-6 border-border/80 bg-paper-raised">
      <CardHeader className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Evolução financeira
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">
            Histórico real de receitas vs. despesas efetivadas
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg bg-paper p-1 border border-border">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                period === p.value
                  ? "bg-paper-raised text-brand font-semibold shadow-xs border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </CardHeader>

      {!hasData ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm font-medium text-text-secondary">
            Nenhuma movimentação registrada no período ({period}).
          </p>
          <p className="text-xs text-text-muted">
            Transações efetivadas deste intervalo serão apresentadas aqui com valores reais.
          </p>
        </div>
      ) : (
        <div className="h-56 w-full md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v) => {
                  if (v === 0) return "R$ 0";
                  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`;
                  return `${v}`;
                }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), ""]}
                labelFormatter={(label) => `Período: ${label}`}
                contentStyle={{
                  backgroundColor: "rgba(24, 30, 27, 0.95)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#f8fafc",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                }}
              />
              <Area
                type="monotone"
                dataKey="receitas"
                name="Receitas"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldGrad)"
                dot={{ r: 2.5, fill: "#10b981", strokeWidth: 1 }}
                activeDot={{ r: 4, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#roseGrad)"
                dot={{ r: 2.5, fill: "#f43f5e", strokeWidth: 1 }}
                activeDot={{ r: 4, fill: "#f43f5e", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
