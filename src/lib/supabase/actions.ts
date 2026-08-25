"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
}

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email ou senha incorretos." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Confirme seu email antes de entrar. Verifique sua caixa de entrada." };
    }
    return { error: "Não foi possível entrar. Tente novamente." };
  }

  redirect("/");
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!nome || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este email já está cadastrado." };
    }
    return { error: "Não foi possível criar sua conta. Tente novamente." };
  }

  redirect("/login?cadastrado=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export interface ResetPasswordState extends AuthState {
  success?: boolean;
}

export async function requestPasswordReset(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Informe seu email." };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  // Sempre retorna sucesso (mesma mensagem exista ou não o email),
  // para não vazar quais emails estão cadastrados.
  return { success: true };
}
