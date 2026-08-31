"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getAmountTone } from "@/lib/utils";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";
import type { TransactionRow } from "@/lib/types";

export function RecentTransactions({ data }: { data: TransactionRow[] }) {
  const { open } = useTransactionModal();

  if (data.length === 0) {
    return (
      <Card className="p-4 md:p-6">
        <CardHeader className="mb-2">
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Transações recentes
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-text-secondary">
            Você ainda não possui transações.
          </p>
          <button
            onClick={open}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            + Adicionar primeira transação
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6">
      <CardHeader className="mb-3 flex items-center justify-between">
        <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
          Transações recentes
        </CardTitle>
        <a
          href="/transacoes"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Ver todos
        </a>
      </CardHeader>

      <div className="space-y-2">
        {data.map((t) => {
          const { sign, tone } = getAmountTone(t.tipo);
          const isExpense = tone === "expense";
          return (
            <div
              key={t.id}
              className="group flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5 hover:bg-white/[0.07] hover:border-emerald-500/30 transition-all shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary group-hover:text-white transition-colors">
                  {t.descricao}
                </p>
                <p className="truncate text-[11px] text-text-muted mt-0.5">
                  {t.categoria} · {t.conta} · {formatDate(t.data)}
                </p>
              </div>
              <span
                className={`shrink-0 pl-3 text-sm font-bold tabular-data ${
                  isExpense ? "neon-glow-red" : "neon-glow-green"
                }`}
              >
                {sign} {formatCurrency(t.valor)}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
