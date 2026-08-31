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
import type { EvolucaoPoint } from "@/lib/types";

const PERIODS = ["7D", "30D", "6M", "1A"] as const;

export function EvolutionChart({ data }: { data: EvolucaoPoint[] }) {
  const [period, setPeriod] = React.useState<(typeof PERIODS)[number]>("6M");

  return (
    <Card className="col-span-1 p-4 xl:col-span-2 md:p-6">
      <CardHeader className="mb-3 flex items-center justify-between">
        <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
          Evolução financeira
        </CardTitle>
        <div className="flex gap-1 rounded-full bg-black/40 border border-white/10 p-1 backdrop-blur-md">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all md:px-3 md:py-1 md:text-xs ${
                period === p
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] font-semibold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className="h-52 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 10, top: 15, bottom: 0 }}>
            <defs>
              <linearGradient id="neonEmeraldGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="neonRoseGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), ""]}
              contentStyle={{
                background: "rgba(16, 24, 20, 0.92)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 0 15px rgba(16, 185, 129, 0.2)",
                borderRadius: 12,
                fontSize: 12,
                color: "#f0fdf4",
              }}
            />
            <Area
              type="monotone"
              dataKey="receitas"
              name="Receitas"
              stroke="#34d399"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#neonEmeraldGlow)"
              dot={{ r: 3, fill: "#34d399", stroke: "#064e3b", strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: "#34d399", stroke: "#ffffff", strokeWidth: 2, className: "animate-pulse" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
