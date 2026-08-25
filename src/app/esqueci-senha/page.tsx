"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type ResetPasswordState,
} from "@/lib/supabase/actions";
import { AuthShell, FormField, FormError } from "@/components/auth/auth-shell";
import { SubmitButton } from "@/components/auth/submit-button";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<ResetPasswordState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha."
      footer={
        <Link href="/login" className="font-medium text-brand hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {state.success ? (
        <p className="rounded-md bg-income-soft px-3 py-2 text-sm text-income">
          Se esse email estiver cadastrado, você vai receber um link em instantes.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <FormError message={state.error} />
          <FormField label="Email" name="email" type="email" autoComplete="email" required />
          <SubmitButton>Enviar link</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
