"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, getAmountTone } from "@/lib/utils";
import { deleteTransaction } from "@/lib/supabase/transaction-actions";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";
import type { TransactionRow } from "@/lib/types";

const TONE_BORDER: Record<string, string> = {
  income: "border-l-income",
  expense: "border-l-expense",
  info: "border-l-info",
};

export function TransactionsList({ data }: { data: TransactionRow[] }) {
  const router = useRouter();
  const { open } = useTransactionModal();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDelete(id: string, descricao: string) {
    if (!confirm(`Excluir "${descricao}"? Essa ação não pode ser desfeita.`)) return;
    setPendingId(id);
    await deleteTransaction(id);
    setPendingId(null);
    router.refresh();
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-paper-raised py-16 text-center">
        <p className="text-sm text-text-secondary">
          Nenhuma transação encontrada.
        </p>
        <button onClick={open} className="text-sm font-medium text-brand hover:underline">
          + Adicionar transação
        </button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-paper-raised">
      {data.map((t) => {
        const { sign, tone } = getAmountTone(t.tipo);
        return (
          <li
            key={t.id}
            className={`group flex items-center justify-between border-l-2 px-4 py-3.5 ${TONE_BORDER[tone]}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{t.descricao}</p>
              <p className="truncate text-xs text-text-muted">
                {t.categoria} · {t.conta} · {formatDate(t.data)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 pl-3">
              <span
                className={`text-sm font-medium tabular-data ${
                  tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : "text-info"
                }`}
              >
                {sign} {formatCurrency(t.valor)}
              </span>
              <button
                onClick={() => handleDelete(t.id, t.descricao)}
                disabled={pendingId === t.id}
                aria-label={`Excluir ${t.descricao}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted opacity-0 transition-colors hover:bg-expense-soft hover:text-expense focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
