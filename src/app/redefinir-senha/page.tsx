"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthShell, FormField, FormError } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string>();
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("Não foi possível atualizar a senha. Solicite um novo link.");
      return;
    }

    router.push("/");
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma nova senha para sua conta.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <FormField
          label="Nova senha"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <FormField
          label="Confirmar nova senha"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Aguarde..." : "Salvar nova senha"}
        </Button>
      </form>
    </AuthShell>
  );
}
