import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { CalendarView } from "@/components/calendario/calendar-view";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: transactions },
    { data: cards },
  ] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false }),
    supabase
      .from("credit_cards")
      .select("id, nome, dia_vencimento, dia_fechamento, cor")
      .eq("user_id", user.id)
      .eq("ativo", true),
  ]);

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
            Calendário Financeiro
          </h1>
          <p className="text-sm text-text-secondary">
            Acompanhe recebimentos, despesas e previsões organizados dia a dia no mês.
          </p>
        </div>

        <CalendarView
          transactions={transactions || []}
          cards={cards || []}
        />
      </div>
    </AppShell>
  );
}
