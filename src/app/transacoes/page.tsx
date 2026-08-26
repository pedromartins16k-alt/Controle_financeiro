import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TransactionsFilters } from "@/components/transactions/transactions-filters";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { NewTransactionButton } from "@/components/transactions/new-transaction-button";
import type { TransactionRow } from "@/lib/types";

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string }>;
}) {
  const { tipo = "", q = "" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: accounts },
    { data: cards },
    { data: categories },
  ] = await Promise.all([
    supabase.from("profiles").select("nome").eq("id", user.id).single(),
    supabase.from("accounts").select("id, nome").eq("user_id", user.id),
    supabase.from("credit_cards").select("id, nome").eq("user_id", user.id),
    supabase.from("categories").select("id, nome"),
  ]);

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  const accountsMap = new Map((accounts ?? []).map((a) => [a.id, a.nome]));
  const cardsMap = new Map((cards ?? []).map((c) => [c.id, c.nome]));
  const categoriesMap = new Map((categories ?? []).map((c) => [c.id, c.nome]));

  let query = supabase
    .from("transactions")
    .select("id, descricao, valor, tipo, data, categoria_id, conta_id, cartao_id, forma_pagamento")
    .eq("user_id", user.id)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (tipo) query = query.eq("tipo", tipo);
  if (q) query = query.ilike("descricao", `%${q}%`);

  const { data: rows, error } = await query;
  if (error) {
    console.error("Erro na busca de transacoes:", error);
  }

  const transacoes: TransactionRow[] = (rows ?? []).map((t: any) => {
    const categoriaNome = t.categoria_id ? categoriesMap.get(t.categoria_id) ?? "Outros" : "Sem categoria";
    const contaOuCartaoNome =
      (t.conta_id && accountsMap.get(t.conta_id)) ||
      (t.cartao_id && cardsMap.get(t.cartao_id)) ||
      (t.forma_pagamento ? t.forma_pagamento.toUpperCase() : "—");

    return {
      id: t.id,
      descricao: t.descricao,
      categoria: categoriaNome,
      conta: contaOuCartaoNome,
      data: t.data,
      valor: Number(t.valor),
      tipo: t.tipo as TransactionRow["tipo"],
    };
  });

  return (
    <AppShell userName={userName}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium text-text-primary">
              Transações
            </h1>
            <p className="text-sm text-text-secondary">
              {transacoes.length}{" "}
              {transacoes.length === 1 ? "transação encontrada" : "transações encontradas"}
            </p>
          </div>
          <div className="hidden sm:block">
            <NewTransactionButton />
          </div>
        </div>

        <TransactionsFilters tipo={tipo} q={q} />
        <TransactionsList data={transacoes} />
      </div>
    </AppShell>
  );
}
