import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import type { OrcamentoRow, MetaRow } from "@/lib/types";

export function BudgetsPreview({ data }: { data: OrcamentoRow[] }) {
  return (
    <Card className="p-4 md:p-6 border-border/80 bg-paper-raised">
      <CardHeader className="mb-3 flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Orçamentos do mês
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">Acompanhamento de tetos de gastos</p>
        </div>
        <a
          href="/orcamentos"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Ver todos &rarr;
        </a>
      </CardHeader>

      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">
            Nenhum orçamento definido para este mês.
          </p>
          <a href="/orcamentos" className="text-xs font-semibold text-brand hover:underline">
            + Criar orçamento
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 4).map((b) => {
            const pct = b.limite > 0 ? (b.gasto / b.limite) * 100 : 0;
            const over = pct > 100;
            return (
              <div key={b.categoria} className="rounded-xl bg-black/25 border border-white/[0.06] p-3.5 hover:border-white/10 transition-all">
                <div className="mb-2 flex items-baseline justify-between text-xs md:text-sm">
                  <span className="font-semibold text-text-primary tracking-tight">{b.categoria}</span>
                  <span className="tabular-data text-text-secondary text-xs">
                    {formatCurrency(b.gasto)} / <span className="text-text-muted">{formatCurrency(b.limite)}</span>
                  </span>
                </div>
                <Progress value={pct} tone={over ? "expense" : pct > 80 ? "alert" : "brand"} />
                {over && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-400">
                    Limite ultrapassado em {formatCurrency(b.gasto - b.limite)}.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export function GoalsPreview({ data }: { data: MetaRow[] }) {
  return (
    <Card className="p-4 md:p-6 border-white/[0.08] bg-paper-raised">
      <CardHeader className="mb-3 flex items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-text-primary md:text-base">
            Metas financeiras
          </CardTitle>
          <p className="text-xs text-text-muted mt-0.5">Progresso dos seus objetivos</p>
        </div>
        <a
          href="/metas"
          className="text-xs font-semibold text-emerald-400 hover:underline"
        >
          Ver todas &rarr;
        </a>
      </CardHeader>

      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-text-secondary">Você ainda não possui metas.</p>
          <a href="/metas" className="text-xs font-semibold text-emerald-400 hover:underline">
            + Criar primeira meta
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 4).map((m) => {
            const pct = m.objetivo > 0 ? (m.guardado / m.objetivo) * 100 : 0;
            return (
              <div key={m.nome} className="rounded-xl bg-black/25 border border-white/[0.06] p-3.5 space-y-2 hover:border-white/10 transition-all">
                <div className="flex items-baseline justify-between text-xs md:text-sm">
                  <span className="font-semibold text-text-primary tracking-tight">{m.nome}</span>
                  <span className="text-xs text-text-muted">até {m.prazo || "Sem prazo"}</span>
                </div>
                <Progress value={pct} />
                <div className="flex items-center justify-between text-xs text-text-secondary pt-0.5">
                  <span className="tabular-data font-medium text-text-primary">
                    {formatCurrency(m.guardado)} <span className="text-text-muted">de {formatCurrency(m.objetivo)}</span>
                  </span>
                  <span className="font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
