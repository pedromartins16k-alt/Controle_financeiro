"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BudgetGoalFormState {
  error?: string;
  success?: boolean;
}

function parseValorBR(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  return Number(normalized);
}

// ----------------------------------------------------
// ORÇAMENTOS (BUDGETS)
// ----------------------------------------------------

export async function upsertBudget(
  _prevState: BudgetGoalFormState,
  formData: FormData
): Promise<BudgetGoalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const id = String(formData.get("id") || "").trim() || undefined;
  const categoriaId = String(formData.get("categoria_id") || "").trim();
  const valorLimiteRaw = String(formData.get("valor_limite") || "");
  const mesReferencia =
    String(formData.get("mes_referencia") || "").trim() ||
    new Date().toISOString().slice(0, 7) + "-01";

  if (!categoriaId) return { error: "Selecione uma categoria para o orçamento." };
  const valorLimite = parseValorBR(valorLimiteRaw);
  if (!Number.isFinite(valorLimite) || valorLimite <= 0) {
    return { error: "Informe um valor limite válido maior que zero." };
  }

  if (id) {
    const { error } = await supabase
      .from("budgets")
      .update({
        categoria_id: categoriaId,
        valor_limite: valorLimite,
        mes_referencia: mesReferencia,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: "Erro ao atualizar orçamento." };
  } else {
    const { error } = await supabase.from("budgets").insert({
      user_id: user.id,
      categoria_id: categoriaId,
      valor_limite: valorLimite,
      mes_referencia: mesReferencia,
    });

    if (error) return { error: "Erro ao cadastrar orçamento." };
  }

  revalidatePath("/");
  revalidatePath("/orcamentos");
  return { success: true };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sua sessão expirou." };

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir o orçamento." };

  revalidatePath("/");
  revalidatePath("/orcamentos");
  return { success: true };
}

// ----------------------------------------------------
// METAS FINANCEIRAS (GOALS)
// ----------------------------------------------------

export async function createGoal(
  _prevState: BudgetGoalFormState,
  formData: FormData
): Promise<BudgetGoalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou. Faça login novamente." };

  const nome = String(formData.get("nome") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const valorObjetivoRaw = String(formData.get("valor_objetivo") || "");
  const valorAtualRaw = String(formData.get("valor_atual") || "0");
  const prazo = String(formData.get("prazo") || "").trim() || null;
  const cor = String(formData.get("cor") || "#10b981").trim();
  const icone = String(formData.get("icone") || "target").trim();

  if (!nome) return { error: "Informe o nome da meta." };
  const valorObjetivo = parseValorBR(valorObjetivoRaw);
  const valorAtual = parseValorBR(valorAtualRaw);

  if (!Number.isFinite(valorObjetivo) || valorObjetivo <= 0) {
    return { error: "Informe um valor objetivo válido maior que zero." };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    nome,
    descricao,
    valor_objetivo: valorObjetivo,
    valor_atual: Number.isFinite(valorAtual) ? valorAtual : 0,
    prazo,
    cor,
    icone,
  });

  if (error) return { error: "Não foi possível criar a meta. Tente novamente." };

  revalidatePath("/");
  revalidatePath("/metas");
  return { success: true };
}

export async function updateGoal(
  _prevState: BudgetGoalFormState,
  formData: FormData
): Promise<BudgetGoalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou." };

  const id = String(formData.get("id") || "").trim();
  const nome = String(formData.get("nome") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim() || null;
  const valorObjetivoRaw = String(formData.get("valor_objetivo") || "");
  const valorAtualRaw = String(formData.get("valor_atual") || "0");
  const prazo = String(formData.get("prazo") || "").trim() || null;
  const cor = String(formData.get("cor") || "#10b981").trim();
  const icone = String(formData.get("icone") || "target").trim();
  const concluida = formData.get("concluida") === "on";

  if (!id) return { error: "Meta inválida." };
  if (!nome) return { error: "Informe o nome da meta." };
  const valorObjetivo = parseValorBR(valorObjetivoRaw);
  const valorAtual = parseValorBR(valorAtualRaw);

  if (!Number.isFinite(valorObjetivo) || valorObjetivo <= 0) {
    return { error: "Informe um valor objetivo válido maior que zero." };
  }

  const { error } = await supabase
    .from("goals")
    .update({
      nome,
      descricao,
      valor_objetivo: valorObjetivo,
      valor_atual: Number.isFinite(valorAtual) ? valorAtual : 0,
      prazo,
      cor,
      icone,
      concluida,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar a meta." };

  revalidatePath("/");
  revalidatePath("/metas");
  return { success: true };
}

export async function depositToGoal(id: string, valorDeposito: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou." };

  const { data: goal, error: fetchErr } = await supabase
    .from("goals")
    .select("valor_atual, valor_objetivo")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !goal) return { error: "Meta não encontrada." };

  const novoValor = Number(goal.valor_atual || 0) + valorDeposito;
  const concluida = novoValor >= Number(goal.valor_objetivo);

  const { error } = await supabase
    .from("goals")
    .update({
      valor_atual: novoValor,
      concluida,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar o saldo da meta." };

  revalidatePath("/");
  revalidatePath("/metas");
  return { success: true };
}

export async function deleteGoal(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sua sessão expirou." };

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir a meta." };

  revalidatePath("/");
  revalidatePath("/metas");
  return { success: true };
}
