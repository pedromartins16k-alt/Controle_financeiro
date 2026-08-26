"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  createCreditCard,
  updateCreditCard,
  type CardFormState,
} from "@/lib/supabase/card-actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/auth-shell";
import type { CreditCardRow } from "@/lib/types";

const COR_OPTIONS = [
  "#6366f1", // Roxo Nubank / Indigo
  "#17594a", // Verde Floresta
  "#0f172a", // Preto Grafite / Carbono
  "#c4432b", // Vermelho
  "#c98a2c", // Dourado / Âmbar
  "#1e3a8a", // Azul Marinho
  "#701a75", // Magenta
];

export function CardModal({
  card,
  onClose,
}: {
  card?: CreditCardRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEditing = !!card;
  const [state, formAction] = useActionState<CardFormState, FormData>(
    isEditing ? updateCreditCard : createCreditCard,
    {}
  );
  const [cor, setCor] = React.useState(card?.cor || COR_OPTIONS[0]);

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
        aria-labelledby="card-modal-titulo"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-paper-raised p-6 shadow-xl sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="card-modal-titulo" className="font-display text-xl font-medium text-text-primary">
            {isEditing ? "Editar cartão" : "Novo cartão de crédito"}
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
          {isEditing && <input type="hidden" name="id" value={card.id} />}
          <input type="hidden" name="cor" value={cor} />

          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm font-medium text-text-primary">
              Nome do cartão
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              defaultValue={card?.nome}
              placeholder="Ex: Nubank Roxinho, Itaú Black"
              required
              autoFocus
              className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="banco" className="mb-1.5 block text-sm font-medium text-text-primary">
                Banco / Emissor
              </label>
              <input
                id="banco"
                name="banco"
                type="text"
                defaultValue={card?.banco || ""}
                placeholder="Ex: Nubank, Inter"
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="ultimos_digitos" className="mb-1.5 block text-sm font-medium text-text-primary">
                Últimos 4 dígitos <span className="text-text-muted">(opcional)</span>
              </label>
              <input
                id="ultimos_digitos"
                name="ultimos_digitos"
                type="text"
                maxLength={4}
                defaultValue={card?.ultimosDigitos || ""}
                placeholder="1234"
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="limite" className="mb-1.5 block text-sm font-medium text-text-primary">
              Limite total
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                R$
              </span>
              <input
                id="limite"
                name="limite"
                type="text"
                inputMode="decimal"
                defaultValue={card ? String(card.limite).replace(".", ",") : "5.000,00"}
                placeholder="0,00"
                required
                className="h-11 w-full rounded-md border border-border-strong bg-paper-raised pl-9 pr-3 text-base font-medium tabular-data text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dia_fechamento" className="mb-1.5 block text-sm font-medium text-text-primary">
                Dia de fechamento
              </label>
              <input
                id="dia_fechamento"
                name="dia_fechamento"
                type="number"
                min={1}
                max={31}
                defaultValue={card?.diaFechamento || 20}
                required
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
            <div>
              <label htmlFor="dia_vencimento" className="mb-1.5 block text-sm font-medium text-text-primary">
                Dia de vencimento
              </label>
              <input
                id="dia_vencimento"
                name="dia_vencimento"
                type="number"
                min={1}
                max={31}
                defaultValue={card?.diaVencimento || 28}
                required
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-text-primary">Cor do cartão</p>
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
                name="ativo"
                defaultChecked={card?.ativo ?? true}
                className="h-4 w-4 rounded border-border-strong accent-brand"
              />
              Cartão ativo
            </label>
          )}

          <SubmitButton>{isEditing ? "Salvar alterações" : "Cadastrar cartão"}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
