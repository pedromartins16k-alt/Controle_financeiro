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

function getGreeting(): string {
  // Pega a hora no horário local aproximado
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

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        {/* Saudação e Contexto Rápido */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-text-primary md:text-2xl">
              {greeting}, {userName} 👋
            </h1>
            <p className="text-xs text-text-muted md:text-sm">
              Aqui está o panorama completo e em tempo real da sua vida financeira.
            </p>
          </div>
        </div>

        {!data.temContas && (
          <div className="rounded-xl border border-dashed border-border-strong bg-paper-raised/80 p-5 text-sm text-text-secondary">
            Você ainda não cadastrou nenhuma conta bancária. Cadastre uma conta para
            começar a acompanhar seu saldo e extratos com total precisão.{" "}
            <a href="/contas" className="font-semibold text-brand hover:underline">
              Adicionar primeira conta &rarr;
            </a>
          </div>
        )}

        <SummaryCards data={data.summary} />

        {/* Insights Financeiros Automáticos */}
        <FinancialInsights
          summary={data.summary}
          categorias={data.gastosPorCategoria}
          orcamentos={data.orcamentos}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <EvolutionChart data={data.evolucao} />
          <CategoryBreakdown data={data.gastosPorCategoria} />
        </div>

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
