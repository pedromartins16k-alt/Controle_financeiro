import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-data";
import { AppShell } from "@/components/layout/app-shell";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetsPreview, GoalsPreview } from "@/components/dashboard/budgets-goals";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { Wallet, ArrowRight } from "lucide-react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, onboarding_concluido")
    .eq("id", user.id)
    .single();

  if (profile && profile.onboarding_concluido === false) {
    redirect("/onboarding");
  }

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";
  const data = await getDashboardData(supabase, user.id);
  const greeting = getGreeting();

  const isUsuarioSemDados =
    !data.temContas && data.transacoesRecentes.length === 0;

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        {/* 1. Saudação Objetiva e Contexto */}
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-text-primary md:text-2xl">
              {greeting}, {userName} 👋
            </h1>
            <p className="text-xs text-text-muted md:text-sm">
              Veja como estão suas finanças e acompanhe seus resultados.
            </p>
          </div>
        </div>

        {/* Banner de Boas-vindas para Usuário Novo */}
        {isUsuarioSemDados && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 md:p-5 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  Suas finanças ainda estão começando!
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Cadastre sua primeira conta bancária para começar a acompanhar seu saldo e extratos com total precisão.
                </p>
              </div>
            </div>
            <a
              href="/contas"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-paper-raised transition-colors hover:bg-brand/90"
            >
              Adicionar primeira conta
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* 2. Resumo Financeiro Completo */}
        <SummaryCards data={data.summary} />

        {/* 3. Evolução Financeira e Maiores Gastos */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <EvolutionChart
            data={data.evolucao}
            dataByPeriod={data.evolucaoPorPeriodo}
          />
          <CategoryBreakdown data={data.gastosPorCategoria} />
        </div>

        {/* 4. Insights Financeiros Fatuais */}
        <FinancialInsights
          summary={data.summary}
          categorias={data.gastosPorCategoria}
          orcamentos={data.orcamentos}
        />

        {/* 5. Transações Recentes, Orçamentos e Metas */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentTransactions data={data.transacoesRecentes} />
          </div>
          <div className="space-y-4">
            <BudgetsPreview data={data.orcamentos} />
            <GoalsPreview data={data.metas} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
