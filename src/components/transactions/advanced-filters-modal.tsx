"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OptionItem {
  id: string;
  nome: string;
}

interface AdvancedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: OptionItem[];
  accounts: OptionItem[];
  cards: OptionItem[];
}

export function AdvancedFiltersModal({
  isOpen,
  onClose,
  categories,
  accounts,
  cards,
}: AdvancedFiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locais sincronizados com searchParams
  const [tipo, setTipo] = React.useState(searchParams.get("tipo") || "");
  const [status, setStatus] = React.useState(searchParams.get("status") || "");
  const [categoriaId, setCategoriaId] = React.useState(searchParams.get("categoria_id") || "");
  const [contaId, setContaId] = React.useState(searchParams.get("conta_id") || "");
  const [cartaoId, setCartaoId] = React.useState(searchParams.get("cartao_id") || "");
  const [formaPagamento, setFormaPagamento] = React.useState(searchParams.get("forma_pagamento") || "");
  const [dataInicio, setDataInicio] = React.useState(searchParams.get("data_inicio") || "");
  const [dataFim, setDataFim] = React.useState(searchParams.get("data_fim") || "");
  const [valorMin, setValorMin] = React.useState(searchParams.get("valor_min") || "");
  const [valorMax, setValorMax] = React.useState(searchParams.get("valor_max") || "");

  React.useEffect(() => {
    if (isOpen) {
      setTipo(searchParams.get("tipo") || "");
      setStatus(searchParams.get("status") || "");
      setCategoriaId(searchParams.get("categoria_id") || "");
      setContaId(searchParams.get("conta_id") || "");
      setCartaoId(searchParams.get("cartao_id") || "");
      setFormaPagamento(searchParams.get("forma_pagamento") || "");
      setDataInicio(searchParams.get("data_inicio") || "");
      setDataFim(searchParams.get("data_fim") || "");
      setValorMin(searchParams.get("valor_min") || "");
      setValorMax(searchParams.get("valor_max") || "");
    }
  }, [isOpen, searchParams]);

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Mantém a busca textual 'q' se houver
    const q = searchParams.get("q");
    if (q) params.set("q", q);

    if (tipo) params.set("tipo", tipo);
    else params.delete("tipo");

    if (status) params.set("status", status);
    else params.delete("status");

    if (categoriaId) params.set("categoria_id", categoriaId);
    else params.delete("categoria_id");

    if (contaId) params.set("conta_id", contaId);
    else params.delete("conta_id");

    if (cartaoId) params.set("cartao_id", cartaoId);
    else params.delete("cartao_id");

    if (formaPagamento) params.set("forma_pagamento", formaPagamento);
    else params.delete("forma_pagamento");

    if (dataInicio) params.set("data_inicio", dataInicio);
    else params.delete("data_inicio");

    if (dataFim) params.set("data_fim", dataFim);
    else params.delete("data_fim");

    if (valorMin) params.set("valor_min", valorMin);
    else params.delete("valor_min");

    if (valorMax) params.set("valor_max", valorMax);
    else params.delete("valor_max");

    router.push(`/transacoes?${params.toString()}`);
    onClose();
  };

  const handleReset = () => {
    setTipo("");
    setStatus("");
    setCategoriaId("");
    setContaId("");
    setCartaoId("");
    setFormaPagamento("");
    setDataInicio("");
    setDataFim("");
    setValorMin("");
    setValorMax("");

    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);

    router.push(`/transacoes?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-strong bg-paper shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand" />
            <h2 className="font-display text-lg font-semibold text-text-primary">
              Filtros Avançados
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-paper-raised hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5 text-sm">
          {/* Status & Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              >
                <option value="">Todos os tipos</option>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              >
                <option value="">Todos</option>
                <option value="efetivada">Efetivada</option>
                <option value="agendada">Agendada</option>
              </select>
            </div>
          </div>

          {/* Período de Data */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Intervalo de Datas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand text-xs sm:text-sm"
              />
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Faixa de Valores */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Faixa de Valor (R$)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Mínimo (ex: 50)"
                value={valorMin}
                onChange={(e) => setValorMin(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              />
              <input
                type="number"
                placeholder="Máximo (ex: 500)"
                value={valorMax}
                onChange={(e) => setValorMax(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Categoria
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Conta e Cartão */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Conta Bancária
              </label>
              <select
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              >
                <option value="">Todas as contas</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Cartão de Crédito
              </label>
              <select
                value={cartaoId}
                onChange={(e) => setCartaoId(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
              >
                <option value="">Todos os cartões</option>
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Forma de Pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-paper-raised px-3 py-2 text-text-primary outline-none focus:border-brand"
            >
              <option value="">Todas as formas</option>
              <option value="pix">Pix</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-paper-raised/40 px-5 py-3.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs text-text-muted hover:text-text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar tudo
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="text-xs"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
