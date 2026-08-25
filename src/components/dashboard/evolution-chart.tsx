"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { EvolucaoPoint } from "@/lib/types";

const PERIODS = ["7D", "30D", "6M", "1A"] as const;

export function EvolutionChart({ data }: { data: EvolucaoPoint[] }) {
  const [period, setPeriod] = React.useState<(typeof PERIODS)[number]>("6M");

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-primary">
          Evolução financeira
        </CardTitle>
        <div className="flex gap-1 rounded-full bg-paper p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? "bg-paper-raised text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: "var(--paper-raised)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="receitas"
              name="Receitas"
              stroke="var(--income)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              name="Despesas"
              stroke="var(--expense)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
