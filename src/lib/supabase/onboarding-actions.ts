"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface OnboardingData {
  nome: string;
  rendaMensal: number;
  banco: string;
  saldoInicial: number;
  meta: string;
  metaValor: number;
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado." };
  }

  try {
    // 1. Atualizar Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nome: data.nome,
        renda_mensal: data.rendaMensal,
        onboarding_concluido: true,
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // 2. Criar a primeira Conta
    const { error: accountError } = await supabase.from("accounts").insert({
      user_id: user.id,
      nome: data.banco,
      tipo: "corrente",
      banco: data.banco,
      saldo_inicial: data.saldoInicial,
      ativa: true,
      icone: "Wallet",
      cor: "#10b981", // default green
    });

    if (accountError) throw accountError;

    // 3. Criar a primeira Meta (se houver)
    if (data.meta && data.metaValor > 0) {
      const { error: metaError } = await supabase.from("goals").insert({
        user_id: user.id,
        nome: data.meta,
        valor_objetivo: data.metaValor,
        valor_atual: 0,
        concluida: false,
        cor: "#3b82f6", // default blue
      });
      if (metaError) throw metaError;
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Erro no onboarding:", error);
    return { error: error.message || "Erro ao concluir configuração inicial." };
  }
}
