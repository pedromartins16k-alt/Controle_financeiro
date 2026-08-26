"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { deleteCreditCard, payCreditCardInvoice } from "@/lib/supabase/card-actions";
import { CartaoVisual } from "./cartao-visual";
import { CardModal } from "./cartao-modal";
import type { CreditCardRow, AccountRow } from "@/lib/types";

export function CartoesGrid({
  data,
  accounts,
}: {
  data: CreditCardRow[];
  accounts: AccountRow[];
}) {
  const router = useRouter();
  const [modalMode, setModalMode] = React.useState<"closed" | "new" | CreditCardRow>("closed");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [payingCard, setPayingCard] = React.useState<CreditCardRow | null>(null);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");

  async function handleDelete(card: CreditCardRow) {
    const confirmado = window.confirm(
      'Excluir o cartão "' + card.nome + '"? Essa ação não pode ser desfeita.'
    );
    if (!confirmado) return;
    setPendingId(card.id);
    const result = await deleteCreditCard(card.id);
    setPendingId(null);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  async function handlePayInvoice() {
    if (!payingCard) return;
    setPendingId(payingCard.id);
    const result = await payCreditCardInvoice(
      payingCard.id,
      payingCard.faturaAtual,
      selectedAccountId || undefined
    );
    setPendingId(null);
    setPayingCard(null);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  const cartoesProximosVencimento = data.filter(
    (c) => c.faturaAtual > 0 && c.diasAteVencimento >= 0 && c.diasAteVencimento <= 3
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Cartões de crédito</h1>
          <p className="text-sm text-text-secondary">
            {data.length} {data.length === 1 ? "cartão cadastrado" : "cartões cadastrados"}
          </p>
        </div>
        <Button size="sm" onClick={() => setModalMode("new")}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Novo cartão
        </Button>
      </div>

      {/* Alertas de Vencimento */}
      {cartoesProximosVencimento.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Atenção ao vencimento das faturas:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs opacity-90">
                {cartoesProximosVencimento.map((c) => (
                  <li key={c.id}>
                    Fatura do <strong>{c.nome}</strong> no valor de{" "}
                    <strong>{formatCurrency(c.faturaAtual)}</strong>{" "}
                    {c.diasAteVencimento === 0
                      ? "vence hoje!"
                      : ence em  dia ().}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Cartões */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-paper-raised py-16 text-center">
          <p className="text-sm text-text-secondary">Nenhum cartão cadastrado ainda.</p>
          <button
            onClick={() => setModalMode("new")}
            className="text-sm font-medium text-brand hover:underline"
          >
            + Cadastrar primeiro cartão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-paper-raised p-4 shadow-sm transition-all hover:shadow-md"
            >
              <CartaoVisual card={card} />

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  {card.faturaAtual === 0 ? (
                    <Badge tone="success">Fatura zerada</Badge>
                  ) : card.diasAteVencimento < 0 ? (
                    <Badge tone="expense">Vencida</Badge>
                  ) : card.diasAteVencimento <= 3 ? (
                    <Badge tone="alert">Vence em breve</Badge>
                  ) : (
                    <Badge tone="info">Fatura aberta</Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {card.faturaAtual > 0 && (
                    <button
                      onClick={() => setPayingCard(card)}
                      className="flex h-8 items-center gap-1 rounded-full bg-brand-soft px-3 text-xs font-medium text-brand-strong transition-colors hover:bg-brand hover:text-white"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      Pagar
                    </button>
                  )}
                  <button
                    onClick={() => setModalMode(card)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-paper hover:text-text-primary"
                    aria-label="Editar cartão"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(card)}
                    disabled={pendingId === card.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-expense-soft hover:text-expense disabled:opacity-50"
                    aria-label="Excluir cartão"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Pagamento de Fatura */}
      {payingCard && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
          onClick={() => setPayingCard(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-xl bg-paper-raised p-6 shadow-xl sm:rounded-xl"
          >
            <h2 className="font-display text-lg font-medium text-text-primary">
              Pagar Fatura — {payingCard.nome}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Valor da fatura:{" "}
              <strong className="text-text-primary">{formatCurrency(payingCard.faturaAtual)}</strong>
            </p>

            <div className="mt-4 space-y-3">
              <label htmlFor="conta_pagamento" className="block text-sm font-medium text-text-primary">
                Debitar de qual conta? <span className="text-text-muted">(opcional)</span>
              </label>
              <select
                id="conta_pagamento"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              >
                <option value="">Não debitar de conta (apenas registrar)</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} (Saldo: {formatCurrency(a.saldoAtual)})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPayingCard(null)}>
                Cancelar
              </Button>
              <Button onClick={handlePayInvoice} disabled={pendingId === payingCard.id}>
                Confirmar pagamento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição de Cartão */}
      {modalMode !== "closed" && (
        <CardModal
          card={modalMode === "new" ? null : modalMode}
          onClose={() => setModalMode("closed")}
        />
      )}
    </div>
  );
}
