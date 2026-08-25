import { Search } from "lucide-react";

const TABS = [
  { value: "", label: "Todas" },
  { value: "receita", label: "Receitas" },
  { value: "despesa", label: "Despesas" },
  { value: "transferencia", label: "Transferências" },
] as const;

export function TransactionsFilters({
  tipo,
  q,
}: {
  tipo: string;
  q: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-1 overflow-x-auto rounded-full bg-paper-raised p-1 sm:overflow-visible">
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/transacoes?${new URLSearchParams({
              ...(tab.value ? { tipo: tab.value } : {}),
              ...(q ? { q } : {}),
            }).toString()}`}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tipo === tab.value
                ? "bg-brand text-paper-raised"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <form action="/transacoes" method="get" className="relative sm:w-64">
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar transação..."
          className="h-10 w-full rounded-full border border-border-strong bg-paper-raised pl-9 pr-3 text-sm text-text-primary outline-none focus:border-brand"
        />
      </form>
    </div>
  );
}
