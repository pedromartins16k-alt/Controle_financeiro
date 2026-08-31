"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  CreditCard,
  Wallet,
  Target,
  PieChart,
  Calendar,
  Settings,
  Plus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "transacoes" | "contas" | "cartoes" | "metas" | "paginas" | "acoes";
  icon?: any;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeTone?: string;
}

const NAVIGATION_PAGES: SearchItem[] = [
  { id: "nav-dash", title: "Dashboard", subtitle: "Visão geral e saldos", category: "paginas", href: "/", icon: PieChart },
  { id: "nav-trans", title: "Transações", subtitle: "Extrato completo de receitas e despesas", category: "paginas", href: "/transacoes", icon: RotateCcw },
  { id: "nav-contas", title: "Contas Bancárias", subtitle: "Gerenciar contas e saldos", category: "paginas", href: "/contas", icon: Wallet },
  { id: "nav-cartoes", title: "Cartões de Crédito", subtitle: "Faturas, limites e fechamento", category: "paginas", href: "/cartoes", icon: CreditCard },
  { id: "nav-relat", title: "Relatórios", subtitle: "Gráficos detalhados e exportação", category: "paginas", href: "/relatorios", icon: SlidersHorizontal },
  { id: "nav-orc", title: "Orçamentos Mensais", subtitle: "Tetos de gastos por categoria", category: "paginas", href: "/orcamentos", icon: PieChart },
  { id: "nav-metas", title: "Metas Financeiras", subtitle: "Objetivos de economia e investimentos", category: "paginas", href: "/metas", icon: Target },
  { id: "nav-cal", title: "Calendário", subtitle: "Agenda de pagamentos e faturas", category: "paginas", href: "/calendario", icon: Calendar },
  { id: "nav-cfg", title: "Configurações", subtitle: "Perfil e preferências", category: "paginas", href: "/configuracoes", icon: Settings },
];

export function GlobalSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { open: openNewTransaction } = useTransactionModal();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Busca em tempo real no Supabase quando digitar
  React.useEffect(() => {
    if (!isOpen) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const term = query.trim();

        const [
          { data: transacoes },
          { data: contas },
          { data: cartoes },
          { data: metas },
        ] = await Promise.all([
          supabase
            .from("transactions")
            .select("id, descricao, valor, tipo, data, status")
            .eq("user_id", user.id)
            .ilike("descricao", `%${term}%`)
            .order("data", { ascending: false })
            .limit(5),
          supabase
            .from("accounts")
            .select("id, nome, saldo_inicial, tipo")
            .eq("user_id", user.id)
            .ilike("nome", `%${term}%`)
            .limit(3),
          supabase
            .from("credit_cards")
            .select("id, nome, limite")
            .eq("user_id", user.id)
            .ilike("nome", `%${term}%`)
            .limit(3),
          supabase
            .from("financial_goals")
            .select("id, nome, valor_alvo, valor_atual")
            .eq("user_id", user.id)
            .ilike("nome", `%${term}%`)
            .limit(3),
        ]);

        const items: SearchItem[] = [];

        // Transações
        (transacoes ?? []).forEach((t) => {
          items.push({
            id: `tr-${t.id}`,
            title: t.descricao,
            subtitle: `${formatDate(t.data)} • ${t.status === "agendada" ? "Agendada" : "Efetivada"}`,
            category: "transacoes",
            badge: `${t.tipo === "despesa" ? "- " : "+ "}${formatCurrency(Number(t.valor))}`,
            badgeTone: t.tipo === "despesa" ? "text-expense" : "text-income",
            icon: t.tipo === "despesa" ? TrendingDown : TrendingUp,
            href: `/transacoes?q=${encodeURIComponent(t.descricao)}`,
          });
        });

        // Contas
        (contas ?? []).forEach((c) => {
          items.push({
            id: `acc-${c.id}`,
            title: c.nome,
            subtitle: `Conta ${c.tipo || "corrente"}`,
            category: "contas",
            icon: Wallet,
            href: "/contas",
          });
        });

        // Cartões
        (cartoes ?? []).forEach((card) => {
          items.push({
            id: `card-${card.id}`,
            title: card.nome,
            subtitle: `Limite: ${formatCurrency(Number(card.limite || 0))}`,
            category: "cartoes",
            icon: CreditCard,
            href: "/cartoes",
          });
        });

        // Metas
        (metas ?? []).forEach((m) => {
          items.push({
            id: `meta-${m.id}`,
            title: m.nome,
            subtitle: `Alvo: ${formatCurrency(Number(m.valor_alvo || 0))}`,
            category: "metas",
            icon: Target,
            href: "/metas",
          });
        });

        setResults(items);
      } catch (err) {
        console.error("Erro na busca global:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Filtrar páginas do app
  const matchingPages = React.useMemo(() => {
    if (!query.trim()) return NAVIGATION_PAGES;
    const q = query.toLowerCase();
    return NAVIGATION_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-sm sm:pt-24 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-strong bg-paper shadow-2xl transition-all">
        {/* Input Header */}
        <div className="relative flex items-center border-b border-border px-4 py-3.5">
          <Search className="h-5 w-5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar transações, contas, cartões, metas ou navegar..."
            className="w-full bg-transparent px-3 text-sm text-text-primary placeholder:text-text-muted outline-none sm:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mr-2 rounded-md p-1 text-text-muted hover:bg-paper-raised hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded bg-paper-raised px-2 py-0.5 text-[11px] font-mono text-text-muted sm:inline-block border border-border">
            ESC
          </kbd>
        </div>

        {/* Action List Container */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {/* Ação rápida de Criar Transação */}
          <button
            onClick={() => {
              onClose();
              openNewTransaction();
            }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-brand-strong hover:bg-brand-soft/30 dark:text-brand transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-paper-raised">
                <Plus className="h-4 w-4 strokeWidth={2.5}" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">Nova Transação</p>
                <p className="text-xs text-text-muted">Cadastrar receita, despesa ou transferência</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted" />
          </button>

          {/* Resultados de Transações / Contas / Metas */}
          {results.length > 0 && (
            <div className="mt-3">
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Resultados encontrados
              </p>
              <div className="space-y-1">
                {results.map((item) => {
                  const Icon = item.icon || Search;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-paper-raised transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-raised text-text-secondary shrink-0 border border-border">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-text-muted">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.badge && (
                        <span
                          className={`ml-2 text-xs font-semibold shrink-0 font-mono ${
                            item.badgeTone || "text-text-primary"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navegação Rápida */}
          {matchingPages.length > 0 && (
            <div className="mt-3">
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Navegação & Telas
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {matchingPages.map((page) => {
                  const Icon = page.icon || PieChart;
                  return (
                    <button
                      key={page.id}
                      onClick={() => handleSelect(page)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-paper-raised transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper-raised text-text-muted shrink-0">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-text-primary">
                          {page.title}
                        </p>
                        <p className="truncate text-[11px] text-text-muted">
                          {page.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading && (
            <div className="py-6 text-center text-xs text-text-muted">
              Buscando...
            </div>
          )}

          {!loading && query && results.length === 0 && matchingPages.length === 0 && (
            <div className="py-8 text-center text-sm text-text-muted">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-paper-raised/40 px-4 py-2.5 text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-paper px-1.5 py-0.5 border border-border">↵</kbd> para selecionar
            </span>
            <span>
              <kbd className="rounded bg-paper px-1.5 py-0.5 border border-border">ESC</kbd> para fechar
            </span>
          </div>
          <span>Controle Financeiro</span>
        </div>
      </div>
    </div>
  );
}
