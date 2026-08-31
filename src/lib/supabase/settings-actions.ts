"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SettingsState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const nome = String(formData.get("nome") || "").trim();

  if (!nome) {
    return { error: "O nome não pode ficar em branco." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nome })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { error: "Não foi possível atualizar o perfil." };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/");
  return { success: true };
}

export async function updatePassword(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const novaSenha = String(formData.get("nova_senha") || "");
  const confirmacao = String(formData.get("confirmacao") || "");

  if (!novaSenha || novaSenha.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  if (novaSenha !== confirmacao) {
    return { error: "A confirmação de senha não confere." };
  }

  const { error } = await supabase.auth.updateUser({
    password: novaSenha,
  });

  if (error) {
    console.error("Erro ao alterar senha:", error);
    return { error: error.message || "Erro ao atualizar a senha." };
  }

  return { success: true };
}
