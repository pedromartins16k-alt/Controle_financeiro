"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getAmountTone } from "@/lib/utils";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";
import type { TransactionRow } from "@/lib/types";

const TONE_BORDER: Record<string, string> = {
  income: "border-l-income",
  expense: "border-l-expense",
  info: "border-l-info",
};

export function RecentTransactions({ data }: { data: TransactionRow[] }) {
  const { open } = useTransactionModal();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-text-primary">
            Transações recentes
          </CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-text-secondary">
            Você ainda não possui transações.
          </p>
          <button onClick={open} className="text-sm font-medium text-brand hover:underline">
            + Adicionar primeira transação
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-primary">
          Transações recentes
        </CardTitle>
        <a href="/transacoes" className="text-xs font-medium text-brand hover:underline">
          Ver todas
        </a>
      </CardHeader>

      <ul className="divide-y divide-border">
        {data.map((t) => {
          const { sign, tone } = getAmountTone(t.tipo);
          return (
            <li
              key={t.id}
              className={`flex items-center justify-between border-l-2 py-3 pl-3 ${TONE_BORDER[tone]}`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">
                  {t.descricao}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {t.categoria} · {t.conta} · {formatDate(t.data)}
                </p>
              </div>
              <span
                className={`shrink-0 pl-3 text-sm font-medium tabular-data ${
                  tone === "income" ? "text-income" : "text-expense"
                }`}
              >
                {sign} {formatCurrency(t.valor)}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
