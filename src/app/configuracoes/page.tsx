import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/configuracoes/settings-view";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  const userName = profile?.nome || user.email?.split("@")[0] || "Usuário";

  return (
    <AppShell userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
            Configurações da Conta
          </h1>
          <p className="text-sm text-text-secondary">
            Gerencie seu perfil, preferências visuais e opções de segurança.
          </p>
        </div>

        <SettingsView
          initialName={userName}
          email={user.email || ""}
        />
      </div>
    </AppShell>
  );
}
