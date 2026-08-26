"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface TransactionFormState {
  error?: string;
  success?: boolean;
}

const TIPOS = ["receita", "despesa", "transferencia"] as const;
const FORMAS_PAGAMENTO = [
  "dinheiro",
  "debito",
  "credito",
  "pix",
  "boleto",
  "transferencia",
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

export async function createTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const tipo = String(formData.get("tipo") || "");
  const descricao = String(formData.get("descricao") || "").trim();
  const valorRaw = String(formData.get("valor") || "");
  const categoriaId = String(formData.get("categoria_id") || "") || null;
  const accountId = String(formData.get("account_id") || "") || null;
  const contaDestinoId = String(formData.get("conta_destino_id") || "") || null;
  const cartaoId = String(formData.get("cartao_id") || "") || null;
  const formaPagamento = String(formData.get("forma_pagamento") || "") || null;
  const data = String(formData.get("data") || "") || new Date().toISOString().slice(0, 10);
  const observacao = String(formData.get("observacao") || "").trim() || null;

  if (!TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return { error: "Selecione o tipo da transação." };
  }
  if (!descricao) {
    return { error: "Informe uma descrição." };
  }
  const valor = parseValorBR(valorRaw);
  if (!Number.isFinite(valor) || valor <= 0) {
    return { error: "Informe um valor válido, maior que zero." };
  }
  if (formaPagamento && !FORMAS_PAGAMENTO.includes(formaPagamento as (typeof FORMAS_PAGAMENTO)[number])) {
    return { error: "Forma de pagamento inválida." };
  }
  if (tipo === "transferencia" && (!accountId || !contaDestinoId)) {
    return { error: "Transferências exigem conta de origem e destino." };
  }
  if (tipo === "transferencia" && accountId === contaDestinoId) {
    return { error: "A conta de origem e destino não podem ser a mesma." };
  }
  if (tipo === "despesa" && formaPagamento === "credito" && !cartaoId) {
    return { error: "Selecione o cartão de crédito para a compra." };
  }

  const accountValue = formaPagamento === "credito" ? null : accountId;
  const cartaoValue = tipo === "despesa" && formaPagamento === "credito" ? cartaoId : null;

  const basePayload: Record<string, any> = {
    user_id: user.id,
    tipo,
    descricao,
    valor,
    categoria_id: tipo === "transferencia" ? null : categoriaId,
    conta_destino_id: tipo === "transferencia" ? contaDestinoId : null,
    cartao_id: cartaoValue,
    forma_pagamento: formaPagamento,
    data,
    observacao,
    status: "efetivada",
  };

  // Tenta com conta_id primeiro (compatível com o schema Postgres padrão)
  let { error } = await supabase.from("transactions").insert({
    ...basePayload,
    conta_id: accountValue,
  });

  // Fallback caso a coluna na tabela se chame account_id
  if (error && error.message?.toLowerCase().includes("conta_id")) {
    const fallback = await supabase.from("transactions").insert({
      ...basePayload,
      account_id: accountValue,
    });
    error = fallback.error;
  }

  if (error) {
    console.error("Erro ao salvar transação:", error);
    return { error: error.message || "Não foi possível salvar a transação." };
  }

  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/contas");
  revalidatePath("/cartoes");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou." };

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir a transação." };

  revalidatePath("/");
  revalidatePath("/transacoes");
  revalidatePath("/contas");
  revalidatePath("/cartoes");
  return { success: true };
}
