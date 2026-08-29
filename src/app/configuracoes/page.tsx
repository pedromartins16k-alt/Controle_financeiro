import { redirect } from next/navigation;
import { createClient } from @/lib/supabase/server;
import { AppShell } from @/components/layout/app-shell;
import { Card, CardHeader, CardTitle } from @/components/ui/card;
import { ThemeToggle } from @/components/theme-toggle;
import { User, Shield, Moon, DollarSign } from lucide-react;

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(/login);

  const { data: profile } = await supabase
    .from(profiles)
    .select(nome)
    .eq(id, user.id)
    .single();
  const userName = profile?.nome || user.email?.split(@)[0] || Usuário;

  return (
    <AppShell userName={userName}>
      <div className=space-y-6 max-w-4xl>
        <div>
          <h1 className=text-2xl font-bold tracking-tight text-text-primary>
            Configurações da Conta
          </h1>
          <p className=text-sm text-text-secondary>
            Gerencie seu perfil, preferências visuais e opções de segurança.
          </p>
        </div>

        <div className=space-y-6>
          {/* Perfil */}
          <Card className=p-5>
            <div className=flex items-center gap-3 border-b border-border pb-4>
              <User className=h-5 w-5 text-brand />
              <h2 className=font-semibold text-text-primary>Dados do Perfil</h2>
            </div>
            <div className=mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm>
              <div>
                <label className=text-xs uppercase text-text-muted>Nome</label>
                <p className=mt-1 font-medium text-text-primary>{userName}</p>
              </div>
              <div>
                <label className=text-xs uppercase text-text-muted>Email</label>
                <p className=mt-1 font-medium text-text-primary>{user.email}</p>
              </div>
            </div>
          </Card>

          {/* Aparência */}
          <Card className=p-5>
            <div className=flex items-center gap-3 border-b border-border pb-4>
              <Moon className=h-5 w-5 text-brand />
              <h2 className=font-semibold text-text-primary>Aparência do Sistema</h2>
            </div>
            <div className=mt-4 flex items-center justify-between>
              <div>
                <p className=text-sm font-medium text-text-primary>Tema da Interface</p>
                <p className=text-xs text-text-muted>Alterne entre modo Claro, Escuro ou Sistema.</p>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          {/* Preferências */}
          <Card className=p-5>
            <div className=flex items-center gap-3 border-b border-border pb-4>
              <DollarSign className=h-5 w-5 text-brand />
              <h2 className=font-semibold text-text-primary>Moeda & Região</h2>
            </div>
            <div className=mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm>
              <div>
                <label className=text-xs uppercase text-text-muted>Moeda Padrão</label>
                <p className=mt-1 font-medium text-text-primary>Real Brasileiro (BRL - R$)</p>
              </div>
              <div>
                <label className=text-xs uppercase text-text-muted>Formato de Data</label>
                <p className=mt-1 font-medium text-text-primary>DD/MM/AAAA (Padrão BR)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
