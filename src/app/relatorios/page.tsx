import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ReportsView } from "@/components/relatorios/reports-view";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

export default async function RelatoriosPage(props: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const searchParams = await props.searchParams;
  const periodo = searchParams.periodo || "mes";

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();
  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  const now = new Date();
  let dataInicio: string | null = null;

  if (periodo === "7d") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    dataInicio = toISODate(d);
  } else if (periodo === "30d") {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dataInicio = toISODate(d);
  } else if (periodo === "mes") {
    dataInicio = toISODate(startOfMonth(now));
  } else if (periodo === "ano") {
    dataInicio = toISODate(startOfYear(now));
  }

  let txQuery = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "efetivada")
    .order("data", { ascending: false });

  if (dataInicio) {
    txQuery = txQuery.gte("data", dataInicio);
  }

  const [{ data: transactions }, { data: categories }, { data: accounts }] = await Promise.all([
    txQuery,
    supabase.from("categories").select("*"),
    supabase.from("accounts").select("*").eq("user_id", user.id),
  ]);

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Relatórios Financeiros & Extratos
          </h1>
          <p className="text-sm text-text-secondary">
            Analise seus fluxos de caixa, detalhamento por categorias e exporte seus dados para contabilidade e planilhas.
          </p>
        </div>

        <ReportsView
          transactions={transactions || []}
          categories={categories || []}
          accounts={accounts || []}
          periodo={periodo}
        />
      </div>
    </AppShell>
  );
}
