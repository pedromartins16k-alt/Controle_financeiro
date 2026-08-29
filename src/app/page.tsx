import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard-data";
import { AppShell } from "@/components/layout/app-shell";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetsPreview, GoalsPreview } from "@/components/dashboard/budgets-goals";

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

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        {!data.temContas && (
          <div className="rounded-lg border border-dashed border-border-strong bg-paper-raised p-5 text-sm text-text-secondary">
            Você ainda não cadastrou nenhuma conta. Cadastre uma conta para
            começar a acompanhar seu saldo de verdade.{" "}
            <a href="/contas" className="font-medium text-brand hover:underline">
              Adicionar conta
            </a>
          </div>
        )}

        <SummaryCards data={data.summary} />

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
