import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { GoalsGrid } from "@/components/meta/goals-grid";
import type { DetailedGoalRow } from "@/lib/types";

export default async function MetasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: goalsData } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("concluida", { ascending: true })
    .order("created_at", { ascending: false });

  const now = new Date();

  const goals: DetailedGoalRow[] = (goalsData || []).map((g: any) => {
    const valorObjetivo = Number(g.valor_objetivo || 0);
    const valorAtual = Number(g.valor_atual || 0);
    const percentual = valorObjetivo > 0 ? (valorAtual / valorObjetivo) * 100 : 0;
    const valorRestante = Math.max(0, valorObjetivo - valorAtual);

    let sugestaoMensal: number | null = null;
    let prazoFormatado: string | null = null;

    if (g.prazo) {
      const prazoDate = new Date(g.prazo);
      prazoFormatado = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(prazoDate);

      // Calcula a quantidade de meses até o prazo
      const diffTime = prazoDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.max(1, Math.round(diffDays / 30));

      if (valorRestante > 0 && diffDays > 0) {
        sugestaoMensal = valorRestante / diffMonths;
      }
    }

    return {
      id: g.id,
      nome: g.nome,
      descricao: g.descricao,
      valorObjetivo,
      valorAtual,
      prazo: prazoFormatado,
      cor: g.cor || "#10b981",
      icone: g.icone,
      concluida: g.concluida || percentual >= 100,
      percentual,
      valorRestante,
      sugestaoMensal,
    };
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Metas & Objetivos Financeiros
          </h1>
          <p className="text-sm text-text-secondary">
            Construa patrimônio, planeje conquistas e acompanhe seu progresso de economia.
          </p>
        </div>

        <GoalsGrid goals={goals} />
      </div>
    </AppShell>
  );
}
