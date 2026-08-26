import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { CartoesGrid } from "@/components/cartao/cartoes-grid";
import type { CreditCardRow, AccountRow } from "@/lib/types";

export default async function CartoesPage() {
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

  // Buscar contas para permitir pagamento de fatura
  const [{ data: cards }, { data: accountsData }, { data: transacoesCartao }] =
    await Promise.all([
      supabase
        .from("credit_cards")
        .select("id, nome, banco, limite, dia_fechamento, dia_vencimento, cor, ultimos_digitos, ativo")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("accounts")
        .select("id, nome, tipo, banco, saldo_inicial, icone, cor, ativa")
        .eq("user_id", user.id)
        .eq("ativa", true),
      supabase
        .from("transactions")
        .select("cartao_id, valor, tipo")
        .eq("user_id", user.id)
        .eq("tipo", "despesa")
        .not("cartao_id", "is", null)
        .eq("status", "efetivada"),
    ]);

  // Totalizar gastos por cartão
  const gastosPorCartao = new Map<string, number>();
  for (const t of transacoesCartao ?? []) {
    if (t.cartao_id) {
      gastosPorCartao.set(
        t.cartao_id,
        (gastosPorCartao.get(t.cartao_id) ?? 0) + Number(t.valor)
      );
    }
  }

  const today = new Date();
  const anoAtual = today.getFullYear();
  const mesAtual = today.getMonth();

  const cartoes: CreditCardRow[] = (cards ?? []).map((c) => {
    const limiteTotal = Number(c.limite);
    const faturaAtual = gastosPorCartao.get(c.id) ?? 0;
    const limiteDisponivel = Math.max(0, limiteTotal - faturaAtual);

    // Calcular data de vencimento do mês atual
    const dataVencimento = new Date(anoAtual, mesAtual, c.dia_vencimento);
    const dataFechamento = new Date(anoAtual, mesAtual, c.dia_fechamento);

    // Se o vencimento deste mês já passou, olha para o próximo mês
    if (today > dataVencimento) {
      dataVencimento.setMonth(dataVencimento.getMonth() + 1);
    }

    const diffTime = dataVencimento.getTime() - today.getTime();
    const diasAteVencimento = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: c.id,
      nome: c.nome,
      banco: c.banco,
      limite: limiteTotal,
      limiteDisponivel,
      diaFechamento: c.dia_fechamento,
      diaVencimento: c.dia_vencimento,
      cor: c.cor || "#1e293b",
      ultimosDigitos: c.ultimos_digitos,
      ativo: c.ativo,
      faturaAtual,
      statusFatura: faturaAtual === 0 ? "paga" : diasAteVencimento < 0 ? "atrasada" : "aberta",
      dataFechamentoFormatada: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(dataFechamento),
      dataVencimentoFormatada: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(dataVencimento),
      diasAteVencimento,
    };
  });

  const accounts: AccountRow[] = (accountsData ?? []).map((a) => ({
    id: a.id,
    nome: a.nome,
    tipo: a.tipo as AccountRow["tipo"],
    banco: a.banco,
    saldoInicial: Number(a.saldo_inicial),
    saldoAtual: Number(a.saldo_inicial),
    icone: a.icone,
    cor: a.cor,
    ativa: a.ativa,
  }));

  return (
    <AppShell userName={userName}>
      <CartoesGrid data={cartoes} accounts={accounts} />
    </AppShell>
  );
}
