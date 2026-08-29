"use client";
/* eslint-disable react-hooks/set-state-in-effect --
   Padrões legítimos aqui: (1) buscar categorias/contas/cartões do Supabase quando o
   modal abre, e (2) resetar o formulário/fechar o modal quando a Server
   Action retorna sucesso — ambos sincronizam com sistemas externos. */

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTransactionModal } from "./transaction-modal-context";
import {
  createTransaction,
  type TransactionFormState,
} from "@/lib/supabase/transaction-actions";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/auth-shell";
import { cn } from "@/lib/utils";

type Tipo = "receita" | "despesa" | "transferencia";

interface CategoryOption {
  id: string;
  nome: string;
  tipo: string;
}
interface AccountOption {
  id: string;
  nome: string;
}
interface CardOption {
  id: string;
  nome: string;
}

const TIPO_OPTIONS: { value: Tipo; label: string; tone: string }[] = [
  { value: "despesa", label: "Despesa", tone: "data-[active=true]:bg-expense" },
  { value: "receita", label: "Receita", tone: "data-[active=true]:bg-income" },
  { value: "transferencia", label: "Transferência", tone: "data-[active=true]:bg-info" },
];

const FORMAS_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "credito", label: "Crédito" },
  { value: "debito", label: "Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "boleto", label: "Boleto" },
  { value: "transferencia", label: "Transferência" },
  { value: "outros", label: "Outros" },
];

export function TransactionModal() {
  const { isOpen, close } = useTransactionModal();
  const router = useRouter();
  const [state, formAction] = useActionState<TransactionFormState, FormData>(
    createTransaction,
    {}
  );

  const [tipo, setTipo] = React.useState<Tipo>("despesa");
  const [formaPagamento, setFormaPagamento] = React.useState<string>("pix");
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [accounts, setAccounts] = React.useState<AccountOption[]>([]);
  const [cards, setCards] = React.useState<CardOption[]>([]);
  const [loadingOptions, setLoadingOptions] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const [repetir, setRepetir] = React.useState(false);
  const [tipoRepeticao, setTipoRepeticao] = React.useState<"parcelada" | "fixa">("parcelada");
  const [intervalo, setIntervalo] = React.useState<"mensal" | "semanal" | "anual">("mensal");
  const [parcelas, setParcelas] = React.useState<number>(2);

  React.useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingOptions(true);

    async function loadOptions() {
      const supabase = createClient();
      const [{ data: cats }, { data: accs }, { data: crds }] = await Promise.all([
        supabase.from("categories").select("id, nome, tipo").order("nome"),
        supabase.from("accounts").select("id, nome").eq("ativa", true).order("nome"),
        supabase.from("credit_cards").select("id, nome").eq("ativo", true).order("nome"),
      ]);
      if (!cancelled) {
        setCategories(cats ?? []);
        setAccounts(accs ?? []);
        setCards(crds ?? []);
        setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setTipo("despesa");
      setFormaPagamento("pix");
      setRepetir(false);
      setTipoRepeticao("parcelada");
      setIntervalo("mensal");
      setParcelas(2);
      close();
      router.refresh();
    }
  }, [state.success, close, router]);

  if (!isOpen) return null;

  const categoriasDoTipo = categories.filter(
    (c) => c.tipo === tipo || c.tipo === "ambos"
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-transacao-titulo"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-paper-raised p-6 shadow-xl sm:rounded-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="nova-transacao-titulo" className="font-display text-xl font-medium text-text-primary">
            Nova transação
          </h2>
          <button
            onClick={close}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-paper hover:text-text-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <FormError message={state.error} />

          {/* Tipo */}
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-paper p-1">
            {TIPO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-active={tipo === opt.value}
                onClick={() => setTipo(opt.value)}
                className={cn(
                  "rounded-full py-2 text-xs font-medium text-text-secondary transition-colors",
                  "data-[active=true]:text-paper-raised",
                  opt.tone
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="tipo" value={tipo} />

          {/* Valor + data */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="valor" className="mb-1.5 block text-sm font-medium text-text-primary">
                Valor
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  R$
                </span>
                <input
                  id="valor"
                  name="valor"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  required
                  autoFocus
                  className="h-11 w-full rounded-md border border-border-strong bg-paper-raised pl-9 pr-3 text-base font-medium tabular-data text-text-primary outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="data" className="mb-1.5 block text-sm font-medium text-text-primary">
                Data
              </label>
              <input
                id="data"
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
                className="h-11 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1.5 block text-sm font-medium text-text-primary">
              Descrição
            </label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder={tipo === "despesa" ? "Ex: Supermercado" : tipo === "receita" ? "Ex: Salário" : "Ex: Reserva de emergência"}
              required
              className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          {tipo !== "transferencia" && (
            <div>
              <label htmlFor="categoria_id" className="mb-1.5 block text-sm font-medium text-text-primary">
                Categoria
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                disabled={loadingOptions}
                className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand disabled:opacity-60"
              >
                <option value="">Sem categoria</option>
                {categoriasDoTipo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {tipo === "transferencia" ? (
              <>
                <div>
                  <label htmlFor="account_id" className="mb-1.5 block text-sm font-medium text-text-primary">
                    Conta de origem
                  </label>
                  <select
                    id="account_id"
                    name="account_id"
                    required
                    className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                  >
                    <option value="">Selecione</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="conta_destino_id" className="mb-1.5 block text-sm font-medium text-text-primary">
                    Conta de destino
                  </label>
                  <select
                    id="conta_destino_id"
                    name="conta_destino_id"
                    required
                    className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                  >
                    <option value="">Selecione</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="forma_pagamento" className="mb-1.5 block text-sm font-medium text-text-primary">
                    Forma de pagamento
                  </label>
                  <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                  >
                    {FORMAS_PAGAMENTO.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {tipo === "despesa" && formaPagamento === "credito" ? (
                  <div>
                    <label htmlFor="cartao_id" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Cartão de crédito
                    </label>
                    {cards.length === 0 ? (
                      <p className="rounded-md border border-dashed border-border-strong px-3 py-2 text-xs text-text-muted">
                        Nenhum cartão cadastrado.
                      </p>
                    ) : (
                      <select
                        id="cartao_id"
                        name="cartao_id"
                        required
                        className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                      >
                        <option value="">Selecione o cartão</option>
                        {cards.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="account_id" className="mb-1.5 block text-sm font-medium text-text-primary">
                      Conta bancária
                    </label>
                    <select
                      id="account_id"
                      name="account_id"
                      className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                    >
                      <option value="">Não informar</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="rounded-md border border-border-strong bg-paper-raised/50 p-4">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                name="repetir"
                value="true"
                checked={repetir}
                onChange={(e) => setRepetir(e.target.checked)}
                className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-text-primary">Repetir transação</span>
            </label>

            {repetir && (
              <div className="mt-4 space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_repeticao"
                      value="parcelada"
                      checked={tipoRepeticao === "parcelada"}
                      onChange={() => setTipoRepeticao("parcelada")}
                      className="h-4 w-4 border-border-strong text-brand focus:ring-brand"
                    />
                    <span className="text-sm text-text-primary">Parcelada</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_repeticao"
                      value="fixa"
                      checked={tipoRepeticao === "fixa"}
                      onChange={() => setTipoRepeticao("fixa")}
                      className="h-4 w-4 border-border-strong text-brand focus:ring-brand"
                    />
                    <span className="text-sm text-text-primary">Fixa / Assinatura</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {tipoRepeticao === "parcelada" ? (
                    <div>
                      <label htmlFor="parcelas" className="mb-1.5 block text-sm font-medium text-text-primary">
                        Qtd. Parcelas
                      </label>
                      <input
                        id="parcelas"
                        name="parcelas"
                        type="number"
                        min="2"
                        max="120"
                        value={parcelas}
                        onChange={(e) => setParcelas(Number(e.target.value))}
                        className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="intervalo" className="mb-1.5 block text-sm font-medium text-text-primary">
                        Intervalo
                      </label>
                      <select
                        id="intervalo"
                        name="intervalo"
                        value={intervalo}
                        onChange={(e) => setIntervalo(e.target.value as any)}
                        className="h-10 w-full rounded-md border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                      >
                        <option value="mensal">Mensal</option>
                        <option value="semanal">Semanal</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="observacao" className="mb-1.5 block text-sm font-medium text-text-primary">
              Observação <span className="text-text-muted">(opcional)</span>
            </label>
            <textarea
              id="observacao"
              name="observacao"
              rows={2}
              className="w-full rounded-md border border-border-strong bg-paper-raised px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <SubmitButton>Salvar transação</SubmitButton>
        </form>
      </div>
    </div>
  );
}
