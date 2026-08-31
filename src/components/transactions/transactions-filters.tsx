"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdvancedFiltersModal } from "./advanced-filters-modal";
import { Button } from "@/components/ui/button";

const TABS = [
  { value: "", label: "Todas" },
  { value: "receita", label: "Receitas" },
  { value: "despesa", label: "Despesas" },
  { value: "transferencia", label: "Transferências" },
] as const;

interface OptionItem {
  id: string;
  nome: string;
}

interface TransactionsFiltersProps {
  tipo: string;
  q: string;
  categories: OptionItem[];
  accounts: OptionItem[];
  cards: OptionItem[];
}

export function TransactionsFilters({
  tipo,
  q,
  categories,
  accounts,
  cards,
}: TransactionsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Calcula quantidade de filtros ativos (além da busca de texto e tipo padrão)
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    const keys = [
      "status",
      "categoria_id",
      "conta_id",
      "cartao_id",
      "forma_pagamento",
      "data_inicio",
      "data_fim",
      "valor_min",
      "valor_max",
    ];
    keys.forEach((k) => {
      if (searchParams.get(k)) count++;
    });
    return count;
  }, [searchParams]);

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/transacoes?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs de Tipos Rápidos */}
        <div className="flex gap-1 overflow-x-auto rounded-full bg-paper-raised p-1 sm:overflow-visible">
          {TABS.map((tab) => {
            const params = new URLSearchParams(searchParams.toString());
            if (tab.value) {
              params.set("tipo", tab.value);
            } else {
              params.delete("tipo");
            }
            return (
              <a
                key={tab.value}
                href={`/transacoes?${params.toString()}`}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  tipo === tab.value
                    ? "bg-brand text-paper-raised"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </div>

        {/* Campo de Busca + Botão Filtros Avançados */}
        <div className="flex items-center gap-2">
          <form action="/transacoes" method="get" className="relative flex-1 sm:w-64">
            {Array.from(searchParams.entries()).map(([k, v]) => {
              if (k === "q") return null;
              return <input key={k} type="hidden" name={k} value={v} />;
            })}
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar transação..."
              className="h-10 w-full rounded-full border border-border-strong bg-paper-raised pl-9 pr-3 text-sm text-text-primary outline-none focus:border-brand"
            />
          </form>

          <Button
            type="button"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="relative h-10 gap-1.5 rounded-full px-3.5 text-xs font-semibold shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-paper-raised">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Chips de filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-text-muted mr-1">Filtros aplicados:</span>

          {searchParams.get("status") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Status: {searchParams.get("status")}
              <button onClick={() => removeFilter("status")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {searchParams.get("categoria_id") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Categoria: {categories.find((c) => c.id === searchParams.get("categoria_id"))?.nome || "Selecionada"}
              <button onClick={() => removeFilter("categoria_id")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {searchParams.get("conta_id") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Conta: {accounts.find((a) => a.id === searchParams.get("conta_id"))?.nome || "Selecionada"}
              <button onClick={() => removeFilter("conta_id")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {searchParams.get("cartao_id") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Cartão: {cards.find((c) => c.id === searchParams.get("cartao_id"))?.nome || "Selecionado"}
              <button onClick={() => removeFilter("cartao_id")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {searchParams.get("forma_pagamento") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Pagamento: {searchParams.get("forma_pagamento")}
              <button onClick={() => removeFilter("forma_pagamento")}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(searchParams.get("data_inicio") || searchParams.get("data_fim")) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Período: {searchParams.get("data_inicio") || "Início"} até {searchParams.get("data_fim") || "Fim"}
              <button
                onClick={() => {
                  removeFilter("data_inicio");
                  removeFilter("data_fim");
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(searchParams.get("valor_min") || searchParams.get("valor_max")) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand-strong dark:text-brand">
              Valor: R$ {searchParams.get("valor_min") || "0"} - R$ {searchParams.get("valor_max") || "∞"}
              <button
                onClick={() => {
                  removeFilter("valor_min");
                  removeFilter("valor_max");
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Modal de Filtros Avançados */}
      <AdvancedFiltersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        accounts={accounts}
        cards={cards}
      />
    </div>
  );
}
