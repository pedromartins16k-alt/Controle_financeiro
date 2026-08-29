use client;

import * as React from react;
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from recharts;
import { Card, CardHeader, CardTitle } from @/components/ui/card;
import { formatCurrency } from @/lib/utils;
import type { EvolucaoPoint } from @/lib/types;

const PERIODS = [7D, 30D, 6M, 1A] as const;

export function EvolutionChart({ data }: { data: EvolucaoPoint[] }) {
  const [period, setPeriod] = React.useState<(typeof PERIODS)[number]>(6M);

  return (
    <Card className=col-span-1 p-3.5 xl:col-span-2 md:p-5>
      <CardHeader className=mb-2 flex items-center justify-between>
        <CardTitle className=text-xs font-semibold text-text-primary md:text-base>
          Evolução financeira
        </CardTitle>
        <div className=flex gap-0.5 rounded-full bg-paper p-0.5>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={ounded-full px-2 py-0.5 text-[10px] font-medium transition-colors md:px-2.5 md:py-1 md:text-xs }
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>

      <div className=h-48 w-full md:h-64>
        <ResponsiveContainer width=100% height=100%>
          <LineChart data={data} margin={{ left: -25, right: 5, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray=3 3 vertical={false} stroke=var(--border) />
            <XAxis
              dataKey=mes
              tickLine={false}
              axisLine={false}
              tick={{ fill: var(--text-muted), fontSize: 10 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: var(--text-muted), fontSize: 10 }}
              tickFormatter={(v) => ${v / 1000}k}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: var(--paper-raised),
                border: 1px solid var(--border),
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type=monotone
              dataKey=receitas
              name=Receitas
              stroke=var(--income)
              strokeWidth={2}
              dot={false}
            />
            <Line
              type=monotone
              dataKey=despesas
              name=Despesas
              stroke=var(--expense)
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
