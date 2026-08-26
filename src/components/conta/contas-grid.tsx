"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { deleteAccount } from "@/lib/supabase/account-actions";
import { AccountModal, ICON_OPTIONS } from "./contas-modal";
import type { AccountRow } from "@/lib/types";

const ICONS: Record<string, (typeof ICON_OPTIONS)[number]["Icon"]> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.value, o.Icon])
);

const TIPO_LABELS: Record<AccountRow["tipo"], string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
  dinheiro: "Dinheiro",
  carteira_digital: "Carteira digital",
  investimento: "Investimento",
  outros: "Outros",
};

export function AccountsGrid({ data }: { data: AccountRow[] }) {
  const router = useRouter();
  const [modalMode, setModalMode] = React.useState<"closed" | "new" | AccountRow>("closed");
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function handleDelete(account: AccountRow) {
    const confirmado = window.confirm(
      'Excluir "' + account.nome + '"? Essa ação não pode ser desfeita.'
    );
    if (!confirmado) return;
    setPendingId(account.id);
    const result = await deleteAccount(account.id);
    setPendingId(null);
    if (result?.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Contas</h1>
          <p className="text-sm text-text-secondary">
            {data.length} {data.length === 1 ? "conta cadastrada" : "contas cadastradas"}
          </p>
        </div>
        <Button size="sm" onClick={() => setModalMode("new")}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nova conta
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-paper-raised py-16 text-center">
          <p className="text-sm text-text-secondary">Nenhuma conta cadastrada ainda.</p>
          <button
            onClick={() => setModalMode("new")}
            className="text-sm font-medium text-brand hover:underline"
          >
            + Adicionar conta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => {
            const Icon = ICONS[a.icone] ?? Wallet;
            return (
              <div
                key={a.id}
                className={cn(
                  "group relative rounded-lg border border-border bg-paper-raised p-5 shadow-[0_1px_2px_rgba(18,24,27,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(18,24,27,0.06)]",
                  !a.ativa && "opacity-60"
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: ${a.cor}1f, color: a.cor }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{a.nome}</p>
                      <p className="text-xs text-text-muted">
                        {TIPO_LABELS[a.tipo]}
                        {a.banco ?  ·  : ""}
                      </p>
                    </div>
                  </div>
                  {!a.ativa && <Badge tone="neutral">Inativa</Badge>}
                </div>

                <p
                  className={cn(
                    "font-display text-xl font-medium tabular-data",
                    a.saldoAtual < 0 ? "text-expense" : "text-text-primary"
                  )}
                >
                  {formatCurrency(a.saldoAtual)}
                </p>

                <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <button
                    onClick={() => setModalMode(a)}
                    className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-paper hover:text-text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={pendingId === a.id}
                    className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-text-muted transition-colors hover:bg-expense-soft hover:text-expense disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalMode !== "closed" && (
        <AccountModal
          account={modalMode === "new" ? null : modalMode}
          onClose={() => setModalMode("closed")}
        />
      )}
    </div>
  );
}
