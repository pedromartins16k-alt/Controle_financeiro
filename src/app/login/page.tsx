"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "@/lib/supabase/actions";
import { AuthShell, FormField, FormError } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(login, {});
  const params = useSearchParams();
  const cadastrado = params.get("cadastrado");

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse seu espaço financeiro."
      footer={
        <span className="text-text-secondary">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-brand hover:underline">
            Criar conta
          </Link>
        </span>
      }
    >
      <form action={formAction} className="space-y-4">
        {cadastrado && (
          <p className="rounded-md bg-income-soft px-3 py-2 text-sm text-income">
            Conta criada. Verifique seu email para confirmar antes de entrar.
          </p>
        )}
        <FormError message={state.error} />

        <FormField label="Email" name="email" type="email" autoComplete="email" required />
        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <Link
            href="/esqueci-senha"
            className="text-xs font-medium text-brand hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitButton>Entrar</SubmitButton>
      </form>
    </AuthShell>
  );
}
