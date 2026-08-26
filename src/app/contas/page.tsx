import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { AccountsGrid } from "@/components/conta/contas-grid";
import type { AccountRow } from "@/lib/types";

export default async function ContasPage() {
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

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, nome, tipo, banco, saldo_inicial, icone, cor, ativa")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: movimentos } = await supabase
    .from("transactions")
    .select("account_id, conta_destino_id, tipo, valor")
    .eq("user_id", user.id)
    .eq("status", "efetivada");

  const saldosPorConta = new Map<string, number>();
  for (const m of movimentos ?? []) {
    const valor = Number(m.valor);
    if (m.tipo === "receita" && m.account_id) {
      saldosPorConta.set(m.account_id, (saldosPorConta.get(m.account_id) ?? 0) + valor);
    } else if (m.tipo === "despesa" && m.account_id) {
      saldosPorConta.set(m.account_id, (saldosPorConta.get(m.account_id) ?? 0) - valor);
    } else if (m.tipo === "transferencia") {
      if (m.account_id) {
        saldosPorConta.set(m.account_id, (saldosPorConta.get(m.account_id) ?? 0) - valor);
      }
      if (m.conta_destino_id) {
        saldosPorConta.set(m.conta_destino_id, (saldosPorConta.get(m.conta_destino_id) ?? 0) + valor);
      }
    }
  }

  const contas: AccountRow[] = (accounts ?? []).map((a) => ({
    id: a.id,
    nome: a.nome,
    tipo: a.tipo as AccountRow["tipo"],
    banco: a.banco,
    saldoInicial: Number(a.saldo_inicial),
    saldoAtual: Number(a.saldo_inicial) + (saldosPorConta.get(a.id) ?? 0),
    icone: a.icone,
    cor: a.cor,
    ativa: a.ativa,
  }));

  return (
    <AppShell userName={userName}>
      <AccountsGrid data={contas} />
    </AppShell>
  );
}
