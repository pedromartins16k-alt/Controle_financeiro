"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseValorBR } from "@/lib/utils";

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

  const repetir = formData.get("repetir") === "true";
  const tipoRepeticao = String(formData.get("tipo_repeticao") || "");
  const intervalo = String(formData.get("intervalo") || "");
  const parcelas = Number(formData.get("parcelas") || 1);

  if (repetir && tipoRepeticao === "parcelada" && parcelas < 2) {
    return { error: "Informe um número válido de parcelas." };
  }
  if (repetir && tipoRepeticao === "parcelada" && parcelas > 360) {
    return { error: "O número máximo de parcelas é 360 (30 anos)." };
  }

  const accountValue = formaPagamento === "credito" ? null : accountId;
  const cartaoValue = tipo === "despesa" && formaPagamento === "credito" ? cartaoId : null;

  const basePayload: Record<string, unknown> = {
    user_id: user.id,
    tipo,
    descricao,
  };

  if (categoriaId && tipo !== "transferencia") {
    basePayload.categoria_id = categoriaId;
  }
  if (formaPagamento) {
    basePayload.forma_pagamento = formaPagamento;
  }
  if (observacao) {
    basePayload.observacao = observacao;
  }
  if (contaDestinoId && tipo === "transferencia") {
    basePayload.conta_destino_id = contaDestinoId;
  }
  if (cartaoValue) {
    basePayload.cartao_id = cartaoValue;
  }

  let insertPayloads: Record<string, unknown>[] = [];

  // Data de hoje (sem hora) para comparar com cada entrada
  const todayStr = new Date().toISOString().slice(0, 10);

  if (repetir) {
    const grupoId = crypto.randomUUID();
    const iterations = tipoRepeticao === "parcelada" ? parcelas : 12; // 12 meses padrão para fixa
    const installmentValue =
      tipoRepeticao === "parcelada"
        ? Number((valor / parcelas).toFixed(2))
        : valor;

    // Ajusta o fuso horário para não cortar 1 dia
    const baseDate = new Date(`${data}T12:00:00Z`);

    for (let i = 0; i < iterations; i++) {
      const iterationDate = new Date(baseDate);

      if (i > 0) {
        if (tipoRepeticao === "parcelada" || intervalo === "mensal") {
          iterationDate.setMonth(iterationDate.getMonth() + i);
        } else if (intervalo === "anual") {
          iterationDate.setFullYear(iterationDate.getFullYear() + i);
        } else if (intervalo === "semanal") {
          iterationDate.setDate(iterationDate.getDate() + i * 7);
        }
      }

      const entryDateStr = iterationDate.toISOString().slice(0, 10);

      // Entradas com data futura ficam como "agendada";
      // apenas a primeira (ou passadas/hoje) ficam "efetivada".
      const entryStatus = entryDateStr <= todayStr ? "efetivada" : "agendada";

      insertPayloads.push({
        ...basePayload,
        status: entryStatus,
        data: entryDateStr,
        valor: installmentValue,
        is_recorrente: tipoRepeticao === "fixa",
        intervalo_recorrencia: tipoRepeticao === "fixa" ? intervalo : null,
        total_parcelas: tipoRepeticao === "parcelada" ? parcelas : null,
        parcela_atual: tipoRepeticao === "parcelada" ? i + 1 : null,
        grupo_id: grupoId,
        descricao:
          tipoRepeticao === "parcelada"
            ? `${descricao} (${i + 1}/${parcelas})`
            : descricao,
      });
    }
  } else {
    insertPayloads.push({
      ...basePayload,
      status: "efetivada",
      data,
      valor,
    });
  }

  // Tenta com conta_id primeiro (compatível com o schema Postgres padrão)
  let payloadsWithAccount = insertPayloads.map((p) =>
    accountValue ? { ...p, conta_id: accountValue } : p
  );

  let { error } = await supabase.from("transactions").insert(payloadsWithAccount);

  // Fallback caso a coluna na tabela se chame account_id
  if (error && error.message?.toLowerCase().includes("conta_id")) {
    payloadsWithAccount = insertPayloads.map((p) =>
      accountValue ? { ...p, account_id: accountValue } : p
    );
    const fallback = await supabase.from("transactions").insert(payloadsWithAccount);
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
