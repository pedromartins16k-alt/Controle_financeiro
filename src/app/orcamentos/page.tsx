import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { BudgetsGrid } from "@/components/orcamento/budgets-grid";
import type { CategoryRow, DetailedBudgetRow } from "@/lib/types";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfNextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export default async function OrcamentosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const mesAtualInicio = startOfMonth(now);
  const mesAtualFim = startOfNextMonth(now);

  const [{ data: categoriesData }, { data: budgetsData }, { data: transacoesMes }] =
    await Promise.all([
      supabase.from("categories").select("*").order("nome"),
      supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .gte("mes_referencia", toISODate(mesAtualInicio))
        .lt("mes_referencia", toISODate(mesAtualFim)),
      supabase
        .from("transactions")
        .select("categoria_id, valor")
        .eq("user_id", user.id)
        .eq("tipo", "despesa")
        .eq("status", "efetivada")
        .gte("data", toISODate(mesAtualInicio))
        .lt("data", toISODate(mesAtualFim)),
    ]);

  const categories: CategoryRow[] = (categoriesData || []).map((c: any) => ({
    id: c.id,
    nome: c.nome,
    cor: c.cor || "#10b981",
    icone: c.icone,
    tipo: c.tipo,
  }));

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  // Agrupa os gastos de cada categoria no mês atual
  const gastosMap = new Map<string, number>();
  (transacoesMes || []).forEach((t: any) => {
    if (t.categoria_id) {
      const atual = gastosMap.get(t.categoria_id) || 0;
      gastosMap.set(t.categoria_id, atual + Number(t.valor));
    }
  });

  const detailedBudgets: DetailedBudgetRow[] = (budgetsData || []).map((b: any) => {
    const cat = categoriesMap.get(b.categoria_id);
    const valorLimite = Number(b.valor_limite || 0);
    const valorGasto = gastosMap.get(b.categoria_id) || 0;
    const percentualGasto = valorLimite > 0 ? (valorGasto / valorLimite) * 100 : 0;

    return {
      id: b.id,
      categoriaId: b.categoria_id,
      categoriaNome: cat?.nome || "Sem categoria",
      categoriaCor: cat?.cor || "#10b981",
      categoriaIcone: cat?.icone,
      mesReferencia: b.mes_referencia,
      valorLimite,
      valorGasto,
      percentualGasto,
    };
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();
  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Planejamento & Orçamentos
          </h1>
          <p className="text-sm text-text-secondary">
            Estabeleça metas de gastos para cada categoria do seu mês e evite surpresas.
          </p>
        </div>

        <BudgetsGrid budgets={detailedBudgets} categories={categories} />
      </div>
    </AppShell>
  );
}
