"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, TrendingUp, TrendingDown, ArrowLeftRight, Loader2 } from "lucide-react";
import { searchGlobalTransactions } from "@/lib/supabase/transaction-actions";

interface SearchResult {
  id: string;
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
  categoria: string;
  parcela_atual: number | null;
  total_parcelas: number | null;
}

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr + "T12:00:00Z"));
}

function TipoIcon({ tipo }: { tipo: string }) {
  if (tipo === "receita")
    return <TrendingUp className="h-3.5 w-3.5 text-income shrink-0" />;
  if (tipo === "despesa")
    return <TrendingDown className="h-3.5 w-3.5 text-expense shrink-0" />;
  return <ArrowLeftRight className="h-3.5 w-3.5 text-text-muted shrink-0" />;
}

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Foca o input ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Busca com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchGlobalTransactions(query);
        if (res.data) setResults(res.data as SearchResult[]);
        else setResults([]);
        setSelectedIndex(0);
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Navegação por teclado
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, results, selectedIndex]);

  function handleSelect(result: SearchResult) {
    onClose();
    router.push(`/transacoes?id=${result.id}`);
  }

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-[10%] z-50 w-full max-w-xl -translate-x-1/2 px-4">
        <div className="overflow-hidden rounded-xl border border-border bg-paper shadow-2xl">
          {/* Campo de busca */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar transações por descrição ou valor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {isPending && (
              <Loader2 className="h-4 w-4 text-text-muted animate-spin shrink-0" />
            )}
            {!isPending && query && (
              <button
                onClick={() => setQuery("")}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Resultados */}
          <div className="max-h-80 overflow-y-auto">
            {query.trim().length >= 2 && !isPending && results.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                Nenhuma transação encontrada para{" "}
                <span className="font-medium text-text-primary">"{query}"</span>
              </p>
            )}

            {query.trim().length < 2 && (
              <p className="px-4 py-8 text-center text-sm text-text-muted">
                Digite pelo menos 2 caracteres para buscar
              </p>
            )}

            {results.length > 0 && (
              <ul>
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-brand-soft/60"
                          : "hover:bg-paper-raised"
                      }`}
                    >
                      <TipoIcon tipo={result.tipo} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {result.descricao}
                          {result.parcela_atual && result.total_parcelas && (
                            <span className="ml-1 text-xs font-normal text-text-muted">
                              ({result.parcela_atual}/{result.total_parcelas})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted">
                          {result.categoria} · {formatDate(result.data)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            result.tipo === "receita"
                              ? "text-income"
                              : result.tipo === "despesa"
                              ? "text-expense"
                              : "text-text-primary"
                          }`}
                        >
                          {formatCurrency(result.valor)}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0 opacity-0 group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer com dica de atalhos */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2">
            <span className="text-[10px] text-text-muted">
              <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">↑</kbd>{" "}
              <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">↓</kbd>{" "}
              navegar
            </span>
            <span className="text-[10px] text-text-muted">
              <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
              selecionar
            </span>
            <span className="text-[10px] text-text-muted">
              <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">Esc</kbd>{" "}
              fechar
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
