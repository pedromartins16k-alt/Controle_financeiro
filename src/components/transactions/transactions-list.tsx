"use client";

import * as React from "react";
import { Trash2, ReceiptText } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-paper-raised/50 py-16 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-emerald-950/60 dark:text-emerald-400 mb-1">
          <ReceiptText className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-text-primary">
            Você ainda não possui transações neste período
          </p>
          <p className="text-xs text-text-muted mt-1 max-w-sm">
            Registre sua primeira receita ou despesa para começar a acompanhar seu fluxo financeiro com clareza.
          </p>
        </div>
        <button
          onClick={open}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-paper-raised shadow-sm transition-all hover:opacity-95"
        >
          + Registrar transação
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
              <p className="flex items-center gap-2 truncate text-sm font-medium text-text-primary">
                {t.descricao}
                {t.is_recorrente && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-strong dark:text-brand">
                    <span>↻</span>
                    <span>{t.intervalo_recorrencia ? t.intervalo_recorrencia.charAt(0).toUpperCase() + t.intervalo_recorrencia.slice(1) : "Recorrente"}</span>
                  </span>
                )}
                {t.total_parcelas && t.total_parcelas > 1 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-info/30 bg-info-soft px-1.5 py-0.5 text-[10px] font-semibold text-info">
                    <span>Parcela {t.parcela_atual || 1}/{t.total_parcelas}</span>
                    {t.parcela_atual && t.total_parcelas - t.parcela_atual > 0 && (
                      <span className="text-text-muted font-normal">
                        ({t.total_parcelas - t.parcela_atual} restante{t.total_parcelas - t.parcela_atual > 1 ? "s" : ""})
                      </span>
                    )}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-text-muted mt-0.5">
                {t.categoria} • {t.conta} • {formatDate(t.data)}
                {t.total_parcelas && t.total_parcelas > 1 && t.parcela_atual && t.total_parcelas - t.parcela_atual > 0 && (
                  <span> • Restam {formatCurrency(t.valor * (t.total_parcelas - t.parcela_atual))}</span>
                )}
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
