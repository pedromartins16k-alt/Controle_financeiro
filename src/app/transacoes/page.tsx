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

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();
  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  let query = supabase
    .from("transactions")
    .select("id, descricao, valor, tipo, data, categories(nome), accounts(nome)")
    .eq("user_id", user.id)
    .order("data", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (tipo) query = query.eq("tipo", tipo);
  if (q) query = query.ilike("descricao", `%${q}%`);

  const { data: rows } = await query;

  const transacoes: TransactionRow[] = (rows ?? []).map((t) => {
    const cat = Array.isArray(t.categories) ? t.categories[0] : t.categories;
    const conta = Array.isArray(t.accounts) ? t.accounts[0] : t.accounts;
    return {
      id: t.id,
      descricao: t.descricao,
      categoria: cat?.nome ?? "Sem categoria",
      conta: conta?.nome ?? "—",
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
