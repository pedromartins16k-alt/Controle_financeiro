import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Bem-vindo | Meu Dinheiro",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verifica se já fez o onboarding para evitar que retorne a esta tela
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_concluido")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_concluido) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <OnboardingWizard />
    </div>
  );
}
