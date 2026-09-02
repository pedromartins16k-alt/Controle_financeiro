"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseValorBR } from "@/lib/utils";

export interface CardFormState {
  error?: string;
  success?: boolean;
}

export async function createCreditCard(
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const nome = String(formData.get("nome") || "").trim();
  const banco = String(formData.get("banco") || "").trim() || null;
  const limiteRaw = String(formData.get("limite") || "");
  const diaFechamento = Number(formData.get("dia_fechamento") || 0);
  const diaVencimento = Number(formData.get("dia_vencimento") || 0);
  const cor = String(formData.get("cor") || "#1e293b");
  const ultimosDigitos = String(formData.get("ultimos_digitos") || "").trim().slice(-4) || null;

  if (!nome) return { error: "Informe um nome para o cartão." };
  const limite = parseValorBR(limiteRaw);
  if (!Number.isFinite(limite) || limite <= 0) {
    return { error: "Informe um limite válido maior que zero." };
  }
  if (!diaFechamento || diaFechamento < 1 || diaFechamento > 31) {
    return { error: "Informe um dia de fechamento válido (1 a 31)." };
  }
  if (!diaVencimento || diaVencimento < 1 || diaVencimento > 31) {
    return { error: "Informe um dia de vencimento válido (1 a 31)." };
  }

  const { error } = await supabase.from("credit_cards").insert({
    user_id: user.id,
    nome,
    banco,
    limite,
    dia_fechamento: diaFechamento,
    dia_vencimento: diaVencimento,
    cor,
    ultimos_digitos: ultimosDigitos,
  });

  if (error) {
    return { error: "Não foi possível cadastrar o cartão. Tente novamente." };
  }

  revalidatePath("/");
  revalidatePath("/cartoes");
  return { success: true };
}

export async function updateCreditCard(
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const banco = String(formData.get("banco") || "").trim() || null;
  const limiteRaw = String(formData.get("limite") || "");
  const diaFechamento = Number(formData.get("dia_fechamento") || 0);
  const diaVencimento = Number(formData.get("dia_vencimento") || 0);
  const cor = String(formData.get("cor") || "#1e293b");
  const ultimosDigitos = String(formData.get("ultimos_digitos") || "").trim().slice(-4) || null;
  const ativo = formData.get("ativo") === "on";

  if (!id) return { error: "Cartão inválido." };
  if (!nome) return { error: "Informe um nome para o cartão." };
  const limite = parseValorBR(limiteRaw);
  if (!Number.isFinite(limite) || limite <= 0) {
    return { error: "Informe um limite válido maior que zero." };
  }
  if (!diaFechamento || diaFechamento < 1 || diaFechamento > 31) {
    return { error: "Informe um dia de fechamento válido (1 a 31)." };
  }
  if (!diaVencimento || diaVencimento < 1 || diaVencimento > 31) {
    return { error: "Informe um dia de vencimento válido (1 a 31)." };
  }

  const { error } = await supabase
    .from("credit_cards")
    .update({
      nome,
      banco,
      limite,
      dia_fechamento: diaFechamento,
      dia_vencimento: diaVencimento,
      cor,
      ultimos_digitos: ultimosDigitos,
      ativo,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Não foi possível salvar as alterações do cartão." };
  }

  revalidatePath("/");
  revalidatePath("/cartoes");
  return { success: true };
}

export async function deleteCreditCard(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou." };

  const { error } = await supabase
    .from("credit_cards")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Não foi possível excluir o cartão. Verifique se não há compras associadas." };
  }

  revalidatePath("/");
  revalidatePath("/cartoes");
  return {};
}

export async function payCreditCardInvoice(
  cartaoId: string,
  valorFatura: number,
  contaPagamentoId?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou." };

  // Se uma conta de débito for selecionada para pagar a fatura, cria a despesa correspondente
  if (contaPagamentoId) {
    const { data: cartao } = await supabase
      .from("credit_cards")
      .select("nome")
      .eq("id", cartaoId)
      .eq("user_id", user.id) // C3: garante que o cartão pertence ao usuário
      .single();

    const nomeCartao = cartao?.nome || "Cartão";

    // C3 FIX: usa conta_id (padrão do schema) com fallback para account_id
    const payload: Record<string, unknown> = {
      user_id: user.id,
      tipo: "despesa",
      descricao: "Pagamento de Fatura - " + nomeCartao,
      valor: valorFatura,
      conta_id: contaPagamentoId,
      forma_pagamento: "debito",
      data: new Date().toISOString().slice(0, 10),
      status: "efetivada",
    };

    const { error: insertError } = await supabase.from("transactions").insert(payload);

    // Fallback para account_id se conta_id não existir no schema
    if (insertError && insertError.message?.toLowerCase().includes("conta_id")) {
      const fallbackPayload = { ...payload, account_id: contaPagamentoId };
      delete fallbackPayload.conta_id;
      const { error: fallbackError } = await supabase.from("transactions").insert(fallbackPayload);
      if (fallbackError) {
        return { error: "Não foi possível registrar o pagamento da fatura." };
      }
    } else if (insertError) {
      return { error: "Não foi possível registrar o pagamento da fatura." };
    }
  }

  revalidatePath("/");
  revalidatePath("/cartoes");
  revalidatePath("/contas");
  revalidatePath("/transacoes");
  return { success: true };
}
