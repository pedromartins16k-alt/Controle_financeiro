import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { NotificacoesView, type NotificationItem } from "@/components/notificacoes/notificacoes-view";
import { formatCurrency } from "@/lib/utils";

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();
  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  // Buscar faturas, orçamentos, metas e transações do mês atual
  const [
    { data: cards },
    { data: budgets },
    { data: goals },
    { data: monthTransactions },
  ] = await Promise.all([
    supabase.from("credit_cards").select("*").eq("user_id", user.id).eq("ativo", true),
    supabase.from("budgets").select("*, categories(nome)").eq("user_id", user.id),
    supabase.from("financial_goals").select("*").eq("user_id", user.id),
    supabase
      .from("transactions")
      .select("categoria_id, valor, tipo, cartao_id, status")
      .eq("user_id", user.id)
      .gte("data", firstDayOfMonth)
      .lte("data", lastDayOfMonth),
  ]);

  const notifications: NotificationItem[] = [];
  const currentDay = now.getDate();

  // 1. Alertas de Vencimento e Limite de Cartões
  (cards || []).forEach((c) => {
    const diaVenc = c.dia_vencimento;
    const diaFech = c.dia_fechamento;
    const diffVenc = diaVenc - currentDay;

    // Calcular gastos do cartão no mês
    const gastosCartao = (monthTransactions || [])
      .filter((t) => t.cartao_id === c.id && t.tipo === "despesa")
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const limite = Number(c.limite || 0);

    // Alerta de Limite (> 80% utilizado)
    if (limite > 0 && gastosCartao >= limite * 0.8) {
      const pct = Math.round((gastosCartao / limite) * 100);
      notifications.push({
        id: `limit-${c.id}`,
        titulo: `Limite de Crédito Alto: ${c.nome}`,
        descricao: `Você já utilizou ${pct}% do limite (${formatCurrency(gastosCartao)} de ${formatCurrency(limite)}).`,
        tipo: pct >= 100 ? "urgente" : "alerta",
        categoria: "cartao",
        data: "Mês Atual",
        href: "/cartoes",
        linkText: "Ver Cartão",
      });
    }

    // Alerta de Vencimento de Fatura (próximos 5 dias)
    if (diffVenc >= 0 && diffVenc <= 5) {
      notifications.push({
        id: `venc-${c.id}`,
        titulo: `Fatura próxima do vencimento: ${c.nome}`,
        descricao: `A fatura no valor estimado de ${formatCurrency(gastosCartao)} vence no dia ${diaVenc} (em ${diffVenc === 0 ? "hoje" : `${diffVenc} dias`}).`,
        tipo: diffVenc <= 2 ? "urgente" : "alerta",
        categoria: "cartao",
        data: "Atenção",
        href: "/cartoes",
        linkText: "Pagar / Ver Fatura",
      });
    }
  });

  // 2. Alertas de Orçamentos Mensais (Estourados ou > 80%)
  const expensesByCategory: Record<string, number> = {};
  (monthTransactions || [])
    .filter((t) => t.tipo === "despesa" && t.categoria_id)
    .forEach((t) => {
      expensesByCategory[t.categoria_id] = (expensesByCategory[t.categoria_id] || 0) + Number(t.valor);
    });

  (budgets || []).forEach((b) => {
    const gasto = expensesByCategory[b.categoria_id] || 0;
    const teto = Number(b.valor_limite || 0);
    const catNome = (b.categories as any)?.nome || "Categoria";

    if (teto > 0) {
      if (gasto >= teto) {
        notifications.push({
          id: `orc-estourado-${b.id}`,
          titulo: `Orçamento Estourado: ${catNome}`,
          descricao: `Você ultrapassou o teto definido de ${formatCurrency(teto)} com um gasto total de ${formatCurrency(gasto)}.`,
          tipo: "urgente",
          categoria: "orcamento",
          data: "Este Mês",
          href: "/orcamentos",
          linkText: "Ajustar Orçamento",
        });
      } else if (gasto >= teto * 0.8) {
        const pct = Math.round((gasto / teto) * 100);
        notifications.push({
          id: `orc-alerta-${b.id}`,
          titulo: `Atenção ao Orçamento: ${catNome}`,
          descricao: `Você atingiu ${pct}% do teto mensal (${formatCurrency(gasto)} de ${formatCurrency(teto)}).`,
          tipo: "alerta",
          categoria: "orcamento",
          data: "Este Mês",
          href: "/orcamentos",
          linkText: "Ver Orçamentos",
        });
      }
    }
  });

  // 3. Alertas de Metas Financeiras
  (goals || []).forEach((g) => {
    const atual = Number(g.valor_atual || 0);
    const alvo = Number(g.valor_alvo || 0);

    if (alvo > 0 && atual >= alvo) {
      notifications.push({
        id: `meta-concluida-${g.id}`,
        titulo: `Meta Concluída: ${g.nome} 🎉`,
        descricao: `Parabéns! Você alcançou 100% da sua meta acumulando ${formatCurrency(atual)}.`,
        tipo: "sucesso",
        categoria: "meta",
        data: "Conquista",
        href: "/metas",
        linkText: "Ver Metas",
      });
    }
  });

  // Notificação Informativa Geral
  notifications.push({
    id: "info-fechamento",
    titulo: "Acompanhe seu Calendário e Extrato",
    descricao: "Mantenha suas despesas categorizadas e confira os lançamentos agendados no calendário.",
    tipo: "info",
    categoria: "sistema",
    data: "Dica",
    href: "/calendario",
    linkText: "Abrir Calendário",
  });

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
            Central de Notificações
          </h1>
          <p className="text-sm text-text-secondary">
            Acompanhe avisos de vencimento de faturas, limites de orçamento e conquistas financeiras.
          </p>
        </div>

        <NotificacoesView notifications={notifications} />
      </div>
    </AppShell>
  );
}
