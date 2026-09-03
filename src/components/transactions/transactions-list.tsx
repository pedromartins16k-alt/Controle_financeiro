"use client";

import * as React from "react";
import { Trash2, Edit3, ReceiptText, AlertTriangle, MoreVertical, X } from "lucide-react";
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

interface DeletePromptState {
  id: string;
  descricao: string;
  grupoId?: string | null;
  isParcelada?: boolean;
  isRecorrente?: boolean;
  totalParcelas?: number | null;
  parcelaAtual?: number | null;
}

export function TransactionsList({ data }: { data: TransactionRow[] }) {
  const router = useRouter();
  const { open, openEdit } = useTransactionModal();

  // Gerenciamento de ação pendente e diálogo de confirmação
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeletePromptState | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = React.useState<string | null>(null);

  // Fecha o menu de ações ao clicar fora
  React.useEffect(() => {
    function handleClickOutside() {
      setActionMenuOpenId(null);
    }
    if (actionMenuOpenId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpenId]);

  async function executeDelete(scope: "single" | "group" = "single") {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id);
    const targetId = deleteTarget.id;
    const targetGrupo = deleteTarget.grupoId;
    setDeleteTarget(null);

    const res = await deleteTransaction(targetId, scope, targetGrupo);
    setPendingId(null);

    if (res?.error) {
      alert("Não foi possível excluir a transação. Tente novamente.");
    } else {
      router.refresh();
    }
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
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-paper-raised shadow-xs">
        {data.map((t) => {
          const { sign, tone } = getAmountTone(t.tipo);
          const isExpense = tone === "expense";
          const isMenuOpen = actionMenuOpenId === t.id;

          return (
            <li
              key={t.id}
              className={`group relative flex items-center justify-between border-l-3 px-4 py-3.5 transition-colors hover:bg-paper/50 ${TONE_BORDER[tone]}`}
            >
              <div className="min-w-0 pr-3">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-text-primary">
                  {t.descricao}
                  {t.is_recorrente && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-strong dark:text-brand">
                      <span>↻</span>
                      <span>
                        {t.intervalo_recorrencia
                          ? t.intervalo_recorrencia.charAt(0).toUpperCase() + t.intervalo_recorrencia.slice(1)
                          : "Recorrente"}
                      </span>
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

              <div className="flex shrink-0 items-center gap-2 pl-2">
                <span
                  className={`text-sm font-bold tabular-data ${
                    isExpense
                      ? "text-rose-600 dark:text-rose-400"
                      : t.tipo === "transferencia"
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {sign} {formatCurrency(t.valor)}
                </span>

                {/* Botões de Ação Diretos (Desktop) & Menu Dropdown (Mobile) */}
                <div className="flex items-center gap-1">
                  {/* Botão Editar */}
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    title="Editar transação"
                    aria-label={`Editar ${t.descricao}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-paper hover:text-brand"
                  >
                    <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>

                  {/* Botão Excluir */}
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({
                        id: t.id,
                        descricao: t.descricao,
                        grupoId: t.grupo_id,
                        isParcelada: Boolean(t.total_parcelas && t.total_parcelas > 1),
                        isRecorrente: Boolean(t.is_recorrente),
                        totalParcelas: t.total_parcelas,
                        parcelaAtual: t.parcela_atual,
                      })
                    }
                    disabled={pendingId === t.id}
                    title="Excluir transação"
                    aria-label={`Excluir ${t.descricao}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal / Diálogo de Confirmação de Exclusão Destrutiva Seguro */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-paper-raised p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertTriangle className="h-6 w-6 strokeWidth={2}" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-bold text-text-primary">
                  Excluir transação?
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Você está prestes a excluir:{" "}
                  <strong className="text-text-primary font-semibold">
                    &quot;{deleteTarget.descricao}&quot;
                  </strong>
                  .
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Essa ação removerá esta movimentação do seu histórico financeiro e atualizará os saldos derivados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Cancelar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Opções especiais para compras parceladas ou assinaturas recorrentes */}
            {deleteTarget.grupoId && (deleteTarget.isParcelada || deleteTarget.isRecorrente) ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-text-primary">
                  {deleteTarget.isParcelada
                    ? `Esta é a parcela ${deleteTarget.parcelaAtual ?? 1}/${deleteTarget.totalParcelas ?? "?"} de uma compra parcelada:`
                    : "Esta transação faz parte de uma série recorrente:"}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => executeDelete("single")}
                    disabled={pendingId !== null}
                    className="w-full rounded-xl border border-border-strong bg-paper px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-paper-raised hover:border-rose-500/40 transition-colors text-left flex items-center justify-between"
                  >
                    <span>
                      {deleteTarget.isParcelada
                        ? "Excluir somente esta parcela"
                        : "Excluir somente esta ocorrência"}
                    </span>
                    <span className="text-[11px] text-text-muted">Mantém as demais</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDelete("group")}
                    disabled={pendingId !== null}
                    className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors text-left flex items-center justify-between"
                  >
                    <span>
                      {deleteTarget.isParcelada
                        ? "Excluir compra parcelada inteira"
                        : "Excluir recorrência inteira"}
                    </span>
                    <span className="text-[11px] text-rose-100">Exclui todas ({deleteTarget.totalParcelas ? `${deleteTarget.totalParcelas}x` : "série"})</span>
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmação simples para transações avulsas */
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={pendingId !== null}
                  className="rounded-xl border border-border-strong px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-paper hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => executeDelete("single")}
                  disabled={pendingId !== null}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {pendingId !== null ? "Excluindo..." : "Excluir transação"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
