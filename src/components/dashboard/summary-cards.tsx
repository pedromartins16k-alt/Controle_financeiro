import { ArrowDownRight, ArrowUpRight, Minus, ShieldCheck, CreditCard, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

/**
 * Exibe variação percentual válida, ou "Sem histórico anterior" se não houver base.
 * Textos e contraste aprimorados para tema escuro.
 */
function Delta({
  pct,
  invert = false,
  emptyLabel = "Sem dados anteriores",
}: {
  pct: number | null;
  invert?: boolean;
  emptyLabel?: string;
}) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-white/10 text-text-muted bg-white/[0.04]">
        <Minus className="h-2.5 w-2.5" strokeWidth={2} />
        {emptyLabel}
      </span>
    );
  }

  const positive = pct >= 0;
  const isGood = invert ? !positive : positive;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs transition-colors",
        isGood
          ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          : "text-rose-400 bg-rose-500/15 border-rose-500/30"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
      ) : (
        <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function SummaryCards({ data }: { data: DashboardSummary }) {
  const isSaldoPositivo = data.saldoDisponivel >= 0;

  return (
    <section aria-label="Visão Geral do Patrimônio e Performance" className="space-y-4">
      {/* 1. Card Hero: Saldo Livre Real & Posição Patrimonial Consolidada */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Destaque Principal (Hero): Saldo Livre Real (Livre de Dívidas) */}
        <div className="lg:col-span-6 xl:col-span-5 relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-[#101714] to-[#0a0f0d] p-5 md:p-6 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7),0_0_24px_rgba(16,185,129,0.12)]">
          {/* Luz de fundo verde neon */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-emerald-500/15 blur-3xl" />
          
          <div className="relative z-10 flex flex-col justify-between h-full gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Saldo Livre Real</span>
              </div>
              <span className="text-[11px] font-medium text-text-muted">
                Liquidez imediata
              </span>
            </div>

            <div>
              <p
                className={cn(
                  "font-display text-3xl font-extrabold tabular-data tracking-tight md:text-4xl",
                  isSaldoPositivo ? "text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.35)]" : "text-rose-400"
                )}
              >
                {formatCurrency(data.saldoDisponivel)}
              </p>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Valor líquido disponível após abater compromissos, faturas e agendamentos do período.
              </p>
            </div>

            {/* Micro métricas de apoio integradas ao Hero */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.08]">
              <div>
                <p className="text-[11px] font-medium text-text-muted">Total em Contas</p>
                <p className="text-sm font-semibold tabular-data text-text-primary">
                  {formatCurrency(data.saldoAtual)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-text-muted">Comprometido</p>
                <p className="text-sm font-semibold tabular-data text-amber-400">
                  {formatCurrency(data.saldoComprometido)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes Secundários de Contas e Compromissos */}
        <div className="lg:col-span-6 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card: Saldo em Contas */}
          <Card className="flex flex-col justify-between p-5 border-white/[0.08] hover:border-emerald-500/25 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                  Saldo em Contas
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  Ativas
                </span>
              </div>
              <p
                className={cn(
                  "font-display text-2xl font-bold tabular-data md:text-3xl",
                  data.saldoAtual >= 0 ? "text-text-primary" : "text-rose-400"
                )}
              >
                {formatCurrency(data.saldoAtual)}
              </p>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Total consolidado em instituições e carteiras cadastradas.
            </p>
          </Card>

          {/* Card: Saldo Comprometido */}
          <Card className="flex flex-col justify-between p-5 border-white/[0.08] hover:border-amber-500/25 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                  Comprometido
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-medium">
                  <CreditCard className="h-3 w-3" />
                  Faturas & Agendadas
                </span>
              </div>
              <p className="font-display text-2xl font-bold tabular-data md:text-3xl text-amber-400">
                {formatCurrency(data.saldoComprometido)}
              </p>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              {data.saldoComprometido > 0
                ? "Total reservado para despesas e parcelas pendentes."
                : "Nenhum compromisso pendente neste período."}
            </p>
          </Card>
        </div>
      </div>

      {/* 2. Régua de Performance Mensal (Receitas, Despesas e Taxa de Poupança) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Receitas do Mês */}
        <Card className="p-4 md:p-5 border-white/[0.08] hover:border-emerald-500/25 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Receitas do Mês
            </span>
            <Delta pct={data.receitasVariacaoPct} />
          </div>
          <p className="font-display text-xl font-bold tabular-data md:text-2xl text-emerald-400">
            {formatCurrency(data.receitasMes)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {data.receitasVariacaoPct !== null ? "Em relação ao mês anterior" : "Primeiro período cadastrado"}
          </p>
        </Card>

        {/* Despesas do Mês */}
        <Card className="p-4 md:p-5 border-white/[0.08] hover:border-rose-500/25 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Despesas do Mês
            </span>
            <Delta pct={data.despesasVariacaoPct} invert />
          </div>
          <p className="font-display text-xl font-bold tabular-data md:text-2xl text-rose-400">
            {formatCurrency(data.despesasMes)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {data.despesasVariacaoPct !== null ? "Em relação ao mês anterior" : "Primeiro período cadastrado"}
          </p>
        </Card>

        {/* Economia / Taxa de Poupança do Mês */}
        <Card className="p-4 md:p-5 border-white/[0.08] hover:border-emerald-500/25 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Economia Líquida
            </span>
            {data.receitasMes > 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                  data.economiaMes >= 0
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/25"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {data.economiaPctRenda.toFixed(0)}% guardado
              </span>
            )}
          </div>
          <p
            className={cn(
              "font-display text-xl font-bold tabular-data md:text-2xl",
              data.economiaMes >= 0 ? "text-text-primary" : "text-rose-400"
            )}
          >
            {formatCurrency(data.economiaMes)}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {data.receitasMes > 0
              ? data.economiaMes >= 0
                ? "Saldo poupado e preservado este mês"
                : "Despesas superaram as receitas no período"
              : "Aguardando receitas do mês"}
          </p>
        </Card>
      </div>
    </section>
  );
}
