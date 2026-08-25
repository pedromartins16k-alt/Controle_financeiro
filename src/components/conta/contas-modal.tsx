

"use client";
/* eslint-disable react-hooks/set-state-in-effect --
   Fecha o modal e atualiza a lista quando a Server Action retorna sucesso —
   sincroniza com o resultado assíncrono do Supabase, mesmo padrão já usado
   no modal de transações (transaction-modal.tsx). */

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Wallet,
  Landmark,
  PiggyBank,
  CreditCard,
  Smartphone,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import { createAccount, updateAccount, type AccountFormState } from "@/lib/supabase/account-actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils";
import type { AccountRow } from "@/lib/types";

const TIPO_OPTIONS: { value: AccountRow["tipo"]; label: string }[] = [
  { value: "corrente", label: "Conta corrente" },
  { value: "poupanca", label: "Poupança" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "carteira_digital", label: "Carteira digital" },
  { value: "investimento", label: "Investimento" },
  { value: "outros", label: "Outros" },
];

export const ICON_OPTIONS: { value: string; Icon: typeof Wallet }[] = [
  { value: "wallet", Icon: Wallet },
  { value: "landmark", Icon: Landmark },
  { value: "piggy-bank", Icon: PiggyBank },
  { value: "credit-card", Icon: CreditCard },
  { value: "smartphone", Icon: Smartphone },
  { value: "trending-up", Icon: TrendingUp },
  { value: "more-horizontal", Icon: MoreHorizontal },
];

const COR_OPTIONS = [
  "#6366f1", // roxo (padrão)
  "#17594a", // verde-pinho (marca)
  "#c98a2c", // âmbar
  "#c4432b", // vermelho-tijolo
  "#3e5c8a", // azul
  "#5a6663", // cinza
];

export function AccountModal({
  account,
  onClose,
}: {
  account?: AccountRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = !!account;
  const [state, formAction] = useActionState<AccountFormState, FormData>(
    isEditing ? updateAccount : createAccount,
    {}
  );
  const [icone, setIcone] = React.useState(account?.icone || "wallet");
  const [cor, setCor] = React.useState(account?.cor || COR_OPTIONS[0]);

  React.useEffect(() => {
    if (state.success) {
      router.refresh();
      onClose();
    }
  }, [state.success, router, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="conta-modal-titulo"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-paper-raised p-6 shadow-xl sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="conta-modal-titulo" className="font-display text-xl font-medium text-text-primary">
            {isEditing ? "Editar conta" : "Nova conta"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-paper hover:text-text-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />
          {isEditing && <input type="hidden" name="id" value={account.id} />}
          <input type="hidden" name="icone" value={icone} />
          <input type="hidden" name="cor" value={cor} />

          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-text-primary">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              defaultValue={account?.nome}
              placeholder="Ex: Nubank, Carteira, Poupança"
              required
              autoFocus
              className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tipo" className="mb-1.5 block text-sm font-medium text-text-primary">
                Tipo
              </label>
              <select
                id="tipo"
                name="tipo"
                defaultValue={account?.tipo || "corrente"}
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              >
                {TIPO_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="banco" className="mb-1.5 block text-sm font-medium text-text-primary">
                Banco <span className="text-text-muted">(opcional)</span>
              </label>
              <input
                id="banco"
                name="banco"
                type="text"
                defaultValue={account?.banco || ""}
                placeholder="Ex: Nubank"
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="saldo_inicial" className="mb-1.5 block text-sm font-medium text-text-primary">
              Saldo inicial
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                R$
              </span>
              <input
                id="saldo_inicial"
                name="saldo_inicial"
                type="text"
                inputMode="decimal"
                defaultValue={
                  account ? String(account.saldoInicial).replace(".", ",") : "0,00"
                }
                placeholder="0,00"
                required
                className="h-11 w-full rounded-md border border-border-strong bg-paper-raised pl-9 pr-3 text-base font-medium tabular-data text-text-primary outline-none focus:border-brand"
              />
            </div>
            {isEditing && (
              <p className="mt-1 text-xs text-text-muted">
                Alterar o saldo inicial não modifica as transações já lançadas.
              </p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-text-primary">Ícone</p>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ value, Icon }) => (
                <button
                  key={value}
                  type="button"
                  aria-label={value}
                  data-active={icone === value}
                  onClick={() => setIcone(value)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-border-strong text-text-secondary transition-colors",
                    "data-[active=true]:border-brand data-[active=true]:bg-brand-soft data-[active=true]:text-brand-strong"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-text-primary">Cor</p>
            <div className="flex flex-wrap gap-2">
              {COR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  data-active={cor === c}
                  onClick={() => setCor(c)}
                  style={{ backgroundColor: c }}
                  className="h-8 w-8 rounded-full ring-offset-2 ring-offset-paper-raised transition-shadow data-[active=true]:ring-2 data-[active=true]:ring-text-primary"
                />
              ))}
            </div>
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                name="ativa"
                defaultChecked={account?.ativa ?? true}
                className="h-4 w-4 rounded border-border-strong accent-brand"
              />
              Conta ativa
            </label>
          )}

          <SubmitButton>{isEditing ? "Salvar alterações" : "Criar conta"}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
