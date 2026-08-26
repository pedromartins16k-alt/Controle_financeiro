"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AccountFormState {
  error?: string;
  success?: boolean;
}

const TIPOS = [
  "corrente",
  "poupanca",
  "dinheiro",
  "carteira_digital",
  "investimento",
  "outros",
] as const;

/** Converte um valor digitado em formato BR ("1.250,50" ou "25,00") para número. */
function parseValorBR(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  return Number(normalized);
}

export async function createAccount(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const nome = String(formData.get("nome") || "").trim();
  const tipo = String(formData.get("tipo") || "");
  const banco = String(formData.get("banco") || "").trim() || null;
  const saldoRaw = String(formData.get("saldo_inicial") || "");
  const icone = String(formData.get("icone") || "wallet");
  const cor = String(formData.get("cor") || "#6366f1");

  if (!nome) return { error: "Informe um nome para a conta." };
  if (!TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return { error: "Selecione um tipo de conta válido." };
  }
  const saldoInicial = parseValorBR(saldoRaw);
  if (!Number.isFinite(saldoInicial)) {
    return { error: "Informe um saldo inicial válido." };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    nome,
    tipo,
    banco,
    saldo_inicial: saldoInicial,
    icone,
    cor,
  });

  if (error) {
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  revalidatePath("/");
  revalidatePath("/contas");
  return { success: true };
}

export async function updateAccount(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const tipo = String(formData.get("tipo") || "");
  const banco = String(formData.get("banco") || "").trim() || null;
  const saldoRaw = String(formData.get("saldo_inicial") || "");
  const icone = String(formData.get("icone") || "wallet");
  const cor = String(formData.get("cor") || "#6366f1");
  const ativa = formData.get("ativa") === "on";

  if (!id) return { error: "Conta inválida." };
  if (!nome) return { error: "Informe um nome para a conta." };
  if (!TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return { error: "Selecione um tipo de conta válido." };
  }
  const saldoInicial = parseValorBR(saldoRaw);
  if (!Number.isFinite(saldoInicial)) {
    return { error: "Informe um saldo inicial válido." };
  }

  const { error } = await supabase
    .from("accounts")
    .update({
      nome,
      tipo,
      banco,
      saldo_inicial: saldoInicial,
      icone,
      cor,
      ativa,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Não foi possível salvar as alterações. Tente novamente." };
  }

  revalidatePath("/");
  revalidatePath("/contas");
  return { success: true };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Não foi possível excluir a conta. Verifique se não há transações vinculadas a ela." };
  }

  revalidatePath("/");
  revalidatePath("/contas");
  return {};
}
