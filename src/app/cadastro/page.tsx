"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "@/lib/supabase/actions";
import { AuthShell, FormField, FormError } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";

export default function SignupPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(signup, {});

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Leva menos de um minuto."
      footer={
        <span className="text-text-secondary">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </span>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormError message={state.error} />

        <FormField label="Nome" name="nome" type="text" autoComplete="name" required />
        <FormField label="Email" name="email" type="email" autoComplete="email" required />
        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <FormField
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />

        <SubmitButton>Criar conta</SubmitButton>
      </form>
    </AuthShell>
  );
}
