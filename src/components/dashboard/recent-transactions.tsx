"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getAmountTone } from "@/lib/utils";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";
import type { TransactionRow } from "@/lib/types";

export function RecentTransactions({ data }: { data: TransactionRow[] }) {
  const { open } = useTransactionModal();

  if (data.length === 0) {
    return (
      <Card className="p-4 md:p-6 border-border/80 bg-paper-raised">
        <CardHeader className="mb-2">
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Transações recentes
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">Últimas movimentações registradas</p>
        </CardHeader>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-text-secondary">
            Você ainda não possui movimentações financeiras.
          </p>
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-1.5 text-xs font-semibold text-paper-raised transition-colors hover:bg-brand/90"
          >
            + Registrar primeira transação
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 border-border/80 bg-paper-raised">
      <CardHeader className="mb-3 flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Transações recentes
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">Últimos lançamentos efetivados</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={open}
            className="text-xs font-semibold text-brand hover:underline"
          >
            + Nova transação
          </button>
          <a
            href="/transacoes"
            className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
          >
            Ver todas &rarr;
          </a>
        </div>
      </CardHeader>

      <div className="space-y-2">
        {data.map((t) => {
          const { sign, tone } = getAmountTone(t.tipo);
          const isExpense = tone === "expense";
          return (
            <div
              key={t.id}
              className="group flex items-center justify-between rounded-xl bg-paper/70 border border-border p-3 hover:bg-paper hover:border-border-strong transition-all shadow-xs"
            >
              <div className="min-w-0 pr-3">
                <p className="truncate text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                  {t.descricao}
                </p>
                <p className="truncate text-[11px] text-text-muted mt-0.5">
                  {t.categoria} · {t.conta} · {formatDate(t.data)}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold tabular-data ${
                  isExpense
                    ? "text-rose-600 dark:text-rose-400"
                    : t.tipo === "transferencia"
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-emerald-600 dark:text-emerald-400"
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
