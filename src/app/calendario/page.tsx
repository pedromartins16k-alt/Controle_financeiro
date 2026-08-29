import { redirect } from next/navigation;
import { createClient } from @/lib/supabase/server;
import { AppShell } from @/components/layout/app-shell;
import { CalendarView } from @/components/calendario/calendar-view;

export default async function CalendarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(/login);

  const { data: profile } = await supabase
    .from(profiles)
    .select(nome)
    .eq(id, user.id)
    .single();
  const userName = profile?.nome || user.email?.split(@)[0] || Usuário;

  const { data: transactions } = await supabase
    .from(transactions)
    .select(*)
    .eq(user_id, user.id)
    .order(data, { ascending: false });

  return (
    <AppShell userName={userName}>
      <div className=space-y-6>
        <div>
          <h1 className=text-2xl font-bold tracking-tight text-text-primary>
            Calendário Financeiro
          </h1>
          <p className=text-sm text-text-secondary>
            Visualize seus recebimentos e pagamentos organizados dia a dia em uma visão mensal.
          </p>
        </div>

        <CalendarView transactions={transactions || []} />
      </div>
    </AppShell>
  );
}
