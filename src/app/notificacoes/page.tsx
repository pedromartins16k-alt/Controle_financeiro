import { redirect } from next/navigation;
import { createClient } from @/lib/supabase/server;
import { AppShell } from @/components/layout/app-shell;
import { Card } from @/components/ui/card;
import { Bell, AlertTriangle, CheckCircle, CreditCard, Info } from lucide-react;
import { formatCurrency, formatDate } from @/lib/utils;

export default async function NotificacoesPage() {
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

  // Buscar faturas e orçamentos para gerar alertas dinâmicos
  const [{ data: cards }, { data: budgets }, { data: transactions }] = await Promise.all([
    supabase.from(credit_cards).select(*).eq(user_id, user.id),
    supabase.from(budgets).select(*, categories(nome)).eq(user_id, user.id),
    supabase.from(transactions).select(*).eq(user_id, user.id),
  ]);

  const notifications: Array<{
    id: string;
    titulo: string;
    descricao: string;
    tipo: alerta | info | sucesso;
    data: string;
  }> = [];

  const today = new Date();

  // Alertas de Vencimento de Cartão
  (cards || []).forEach((c) => {
    const diaVenc = c.dia_vencimento;
    const diffDays = diaVenc - today.getDate();
    if (diffDays >= 0 && diffDays <= 5) {
      notifications.push({
        id: card-,
        titulo: Fatura próxima do vencimento: ,
        descricao: A fatura do seu cartão  vence no dia  (em  dias).,
        tipo: alerta,
        data: Hoje,
      });
    }
  });

  // Alertas de boas-vindas e metas
  notifications.push({
    id: welcome,
    titulo: Bem-vindo ao Controle Financeiro!,
    descricao: Comece cadastrando suas contas bancárias e organizando seus orçamentos do mês.,
    tipo: info,
    data: Recente,
  });

  return (
    <AppShell userName={userName}>
      <div className=space-y-6>
        <div>
          <h1 className=text-2xl font-bold tracking-tight text-text-primary>
            Central de Notificações
          </h1>
          <p className=text-sm text-text-secondary>
            Acompanhe avisos de vencimento de faturas, limites de orçamento e novidades da sua conta.
          </p>
        </div>

        <div className=space-y-3>
          {notifications.map((n) => (
            <Card key={n.id} className=flex items-start gap-4 p-4>
              <div
                className={lex h-10 w-10 shrink-0 items-center justify-center rounded-xl }
              >
                {n.tipo === alerta ? (
                  <AlertTriangle className=h-5 w-5 />
                ) : n.tipo === sucesso ? (
                  <CheckCircle className=h-5 w-5 />
                ) : (
                  <Info className=h-5 w-5 />
                )}
              </div>

              <div className=flex-1>
                <div className=flex items-center justify-between>
                  <h3 className=text-sm font-semibold text-text-primary>{n.titulo}</h3>
                  <span className=text-xs text-text-muted>{n.data}</span>
                </div>
                <p className=mt-1 text-xs text-text-secondary>{n.descricao}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
