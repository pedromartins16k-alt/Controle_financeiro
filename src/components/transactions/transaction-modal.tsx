"use client";
/* eslint-disable react-hooks/set-state-in-effect --
   Padrões legítimos aqui: (1) buscar categorias/contas/cartões do Supabase quando o
   modal abre, e (2) resetar o formulário/fechar o modal quando a Server
   Action retorna sucesso — ambos sincronizam com sistemas externos. */

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { useTransactionModal } from "./transaction-modal-context";
import {
  createTransaction,
  type TransactionFormState,
} from "@/lib/supabase/transaction-actions";
import { createClient } from "@/lib/supabase/client";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormError } from "@/components/auth/auth-shell";
import { cn, parseNaturalLanguageTransaction, formatCurrency } from "@/lib/utils";

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

  // Campos controlados para suporte à entrada inteligente / linguagem natural
  const [valorStr, setValorStr] = React.useState("");
  const [descricaoStr, setDescricaoStr] = React.useState("");
  const [categoriaIdStr, setCategoriaIdStr] = React.useState("");

  // Modo entrada rápida / linguagem natural
  const [quickInput, setQuickInput] = React.useState("");
  const [showQuickInput, setShowQuickInput] = React.useState(false);
  const [interpretedPreview, setInterpretedPreview] = React.useState<{
    descricao: string;
    valor: number;
    tipo: "receita" | "despesa";
    categoriaSugerida?: string;
  } | null>(null);

  // Feedback de sucesso
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

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

  // Parser em tempo real quando o usuário digita no input rápido
  React.useEffect(() => {
    if (!quickInput.trim()) {
      setInterpretedPreview(null);
      return;
    }
    const res = parseNaturalLanguageTransaction(quickInput);
    if (res && res.valor) {
      setInterpretedPreview({
        descricao: res.descricao,
        valor: res.valor,
        tipo: res.tipo,
        categoriaSugerida: res.categoriaSugerida,
      });
    } else {
      setInterpretedPreview(null);
    }
  }, [quickInput]);

  const applyInterpreted = () => {
    if (!interpretedPreview) return;
    setTipo(interpretedPreview.tipo);
    setDescricaoStr(interpretedPreview.descricao);
    setValorStr(
      interpretedPreview.valor.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );

    // Encontra id da categoria sugerida se existir
    if (interpretedPreview.categoriaSugerida) {
      const cat = categories.find((c) =>
        c.nome.toLowerCase().includes(interpretedPreview.categoriaSugerida!.toLowerCase())
      );
      if (cat) setCategoriaIdStr(cat.id);
    }

    setShowQuickInput(false);
    setQuickInput("");
    setInterpretedPreview(null);
  };

  React.useEffect(() => {
    if (state.success) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
        formRef.current?.reset();
        setTipo("despesa");
        setValorStr("");
        setDescricaoStr("");
        setCategoriaIdStr("");
        setFormaPagamento("pix");
        setRepetir(false);
        setTipoRepeticao("parcelada");
        setIntervalo("mensal");
        setParcelas(2);
        close();
        router.refresh();
      }, 1000);
      return () => clearTimeout(timer);
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
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-paper-raised p-6 shadow-2xl sm:rounded-2xl border border-border"
      >
        {/* Banner de Feedback de Sucesso Claro */}
        {showSuccessToast && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper-raised/95 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 mb-3">
              <Check className="h-8 w-8 strokeWidth={3}" />
            </div>
            <p className="font-display text-lg font-bold text-text-primary">
              ✓ Transação adicionada com sucesso!
            </p>
            <p className="text-xs text-text-muted mt-1">Atualizando seus saldos e relatórios...</p>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="nova-transacao-titulo" className="font-display text-xl font-bold text-text-primary">
              Nova transação
            </h2>
            <button
              type="button"
              onClick={() => setShowQuickInput((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/20 dark:bg-emerald-950/60 dark:text-emerald-300"
              title="Entrada rápida em linguagem natural"
            >
              <Sparkles className="h-3 w-3" />
              Entrada com IA
            </button>
          </div>
          <button
            onClick={close}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-paper hover:text-text-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Bloco de Entrada Inteligente (Linguagem Natural) */}
        {showQuickInput && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Digite de forma simples:
              </span>
              <span className="text-[10px] text-text-muted font-normal">Ex: &quot;mercado 89,90&quot; ou &quot;uber 25&quot;</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyInterpreted();
                  }
                }}
                placeholder="Ex: Almoço 34,50 ou Salario 4500"
                className="h-9 flex-1 rounded-lg border border-border-strong bg-paper px-3 text-xs text-text-primary outline-none focus:border-brand"
                autoFocus
              />
              <button
                type="button"
                onClick={applyInterpreted}
                disabled={!interpretedPreview}
                className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 text-xs font-semibold text-paper-raised transition-opacity disabled:opacity-40"
              >
                Preencher
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {interpretedPreview && (
              <div className="rounded-lg bg-paper p-2 text-[11px] text-text-secondary border border-border flex items-center justify-between">
                <span>
                  Sugestão: <strong>{interpretedPreview.tipo.toUpperCase()}</strong> de{" "}
                  <strong className="text-text-primary">{formatCurrency(interpretedPreview.valor)}</strong> em{" "}
                  &quot;{interpretedPreview.descricao}&quot; ({interpretedPreview.categoriaSugerida})
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Pronto</span>
              </div>
            )}
          </div>
        )}

        <form ref={formRef} action={formAction} className="space-y-4">
          <FormError message={state.error} />

          {/* Tipo */}
          <div className="grid grid-cols-3 gap-1.5 rounded-full bg-paper p-1 border border-border">
            {TIPO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                data-active={tipo === opt.value}
                onClick={() => setTipo(opt.value)}
                className={cn(
                  "rounded-full py-2 text-xs font-medium text-text-secondary transition-colors",
                  "data-[active=true]:text-paper-raised font-semibold",
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
              <label htmlFor="valor" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                Valor
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-semibold">
                  R$
                </span>
                <input
                  id="valor"
                  name="valor"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorStr}
                  onChange={(e) => setValorStr(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised pl-9 pr-3 text-base font-semibold tabular-data text-text-primary outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label htmlFor="data" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                Data
              </label>
              <input
                id="data"
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
                className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
              Descrição
            </label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              placeholder={tipo === "despesa" ? "Ex: Supermercado Extra" : tipo === "receita" ? "Ex: Salário Mensal" : "Ex: Reserva de emergência"}
              value={descricaoStr}
              onChange={(e) => setDescricaoStr(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          {tipo !== "transferencia" && (
            <div>
              <label htmlFor="categoria_id" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                Categoria
              </label>
              <select
                id="categoria_id"
                name="categoria_id"
                value={categoriaIdStr}
                onChange={(e) => setCategoriaIdStr(e.target.value)}
                disabled={loadingOptions}
                className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand disabled:opacity-60"
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
                  <label htmlFor="account_id" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Conta de origem
                  </label>
                  <select
                    id="account_id"
                    name="account_id"
                    required
                    className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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
                  <label htmlFor="conta_destino_id" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Conta de destino
                  </label>
                  <select
                    id="conta_destino_id"
                    name="conta_destino_id"
                    required
                    className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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
                  <label htmlFor="forma_pagamento" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Forma de pagamento
                  </label>
                  <select
                    id="forma_pagamento"
                    name="forma_pagamento"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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
                    <label htmlFor="cartao_id" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                      Cartão de crédito
                    </label>
                    {cards.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border-strong px-3 py-2 text-xs text-text-muted">
                        Nenhum cartão cadastrado.
                      </p>
                    ) : (
                      <select
                        id="cartao_id"
                        name="cartao_id"
                        required
                        className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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
                    <label htmlFor="account_id" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                      Conta bancária
                    </label>
                    <select
                      id="account_id"
                      name="account_id"
                      className="h-11 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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

          <div className="rounded-xl border border-border-strong bg-paper p-4">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                name="repetir"
                value="true"
                checked={repetir}
                onChange={(e) => setRepetir(e.target.checked)}
                className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand"
              />
              <span className="text-sm font-semibold text-text-primary">Repetir transação</span>
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
                      <label htmlFor="parcelas" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Qtd. Parcelas
                      </label>
                      <input
                        id="parcelas"
                        name="parcelas"
                        type="number"
                        min="2"
                        max="360"
                        value={parcelas}
                        onChange={(e) => setParcelas(Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="intervalo" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
                        Intervalo
                      </label>
                      <select
                        id="intervalo"
                        name="intervalo"
                        value={intervalo}
                        onChange={(e) => setIntervalo(e.target.value as any)}
                        className="h-10 w-full rounded-xl border border-border-strong bg-paper-raised px-3 text-sm text-text-primary outline-none focus:border-brand"
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
            <label htmlFor="observacao" className="mb-1.5 block text-xs font-semibold text-text-primary uppercase tracking-wider">
              Observação <span className="text-text-muted font-normal lowercase">(opcional)</span>
            </label>
            <textarea
              id="observacao"
              name="observacao"
              rows={2}
              className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <SubmitButton>Salvar transação</SubmitButton>
        </form>
      </div>
    </div>
  );
}
