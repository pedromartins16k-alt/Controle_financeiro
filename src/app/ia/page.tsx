import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { AiChatView } from "@/components/ia/ai-chat-view";

export const metadata = {
  title: "Assistente IA | Meu Dinheiro",
};

export default async function IaPage() {
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
      <div className="space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
            Assistente Financeiro IA
          </h1>
          <p className="text-sm text-text-secondary">
            Tire dúvidas, peça dicas de economia e receba diagnósticos automáticos dos seus gastos.
          </p>
        </div>

        <AiChatView userName={userName} />
      </div>
    </AppShell>
  );
}
