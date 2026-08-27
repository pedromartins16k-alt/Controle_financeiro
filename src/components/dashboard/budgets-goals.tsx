import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { OrcamentoRow, MetaRow } from "@/lib/types";

export function BudgetsPreview({ data }: { data: OrcamentoRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-primary">
          Orçamentos do mês
        </CardTitle>
        <a href="/orcamentos" className="text-xs font-medium text-brand hover:underline">
          Ver todos
        </a>
      </CardHeader>

      {data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">
            Nenhum orçamento definido para este mês.
          </p>
          <a href="/orcamentos" className="text-sm font-medium text-brand hover:underline">
            + Criar orçamento
          </a>
        </div>
      )}

      <div className="space-y-4">
        {data.map((b) => {
          const pct = (b.gasto / b.limite) * 100;
          const over = pct > 100;
          return (
            <div key={b.categoria}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-text-primary">{b.categoria}</span>
                <span className="tabular-data text-text-secondary">
                  {formatCurrency(b.gasto)} / {formatCurrency(b.limite)}
                </span>
              </div>
              <Progress value={pct} tone={over ? "expense" : pct > 80 ? "alert" : "brand"} />
              {over && (
                <p className="mt-1 text-xs text-expense">
                  Você ultrapassou o orçamento de {b.categoria}.
                </p>
              )}
              {!over && pct > 80 && (
                <p className="mt-1 text-xs text-alert">
                  Já utilizou {pct.toFixed(0)}% do orçamento de {b.categoria}.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function GoalsPreview({ data }: { data: MetaRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-text-primary">
          Metas financeiras
        </CardTitle>
        <a href="/metas" className="text-xs font-medium text-brand hover:underline">
          Ver todas
        </a>
      </CardHeader>

      {data.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">Você ainda não possui metas.</p>
          <a href="/metas" className="text-sm font-medium text-brand hover:underline">
            + Criar primeira meta
          </a>
        </div>
      )}

      <div className="space-y-4">
        {data.map((m) => {
          const pct = (m.guardado / m.objetivo) * 100;
          return (
            <div key={m.nome}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-text-primary">{m.nome}</span>
                <span className="text-xs text-text-muted">até {m.prazo}</span>
              </div>
              <Progress value={pct} />
              <p className="mt-1.5 text-xs text-text-secondary">
                <span className="tabular-data text-text-primary">
                  {formatCurrency(m.guardado)}
                </span>{" "}
                de {formatCurrency(m.objetivo)} · {pct.toFixed(0)}%
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
