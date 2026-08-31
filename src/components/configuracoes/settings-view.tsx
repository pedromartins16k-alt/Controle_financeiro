"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  User,
  Shield,
  Moon,
  DollarSign,
  Bell,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  updateProfile,
  updatePassword,
  type SettingsState,
} from "@/lib/supabase/settings-actions";

export function SettingsView({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [profileState, profileAction, isPendingProfile] = useActionState<SettingsState, FormData>(
    updateProfile,
    {}
  );

  const [passwordState, passwordAction, isPendingPassword] = useActionState<SettingsState, FormData>(
    updatePassword,
    {}
  );

  const passwordFormRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (passwordState.success) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 1. Dados do Perfil (Editável) */}
      <Card className="p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <User className="h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Dados do Perfil
            </h2>
            <p className="text-xs text-text-muted">Atualize seu nome de exibição no sistema.</p>
          </div>
        </div>

        <form action={profileAction} className="mt-4 space-y-4">
          {profileState.error && (
            <div className="flex items-center gap-2 rounded-xl bg-expense/10 p-3 text-xs font-semibold text-expense">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileState.error}</span>
            </div>
          )}

          {profileState.success && (
            <div className="flex items-center gap-2 rounded-xl bg-income/10 p-3 text-xs font-semibold text-income">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Perfil atualizado com sucesso!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={initialName}
                required
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                E-mail (Cadastrado)
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPendingProfile}
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <Save className="h-3.5 w-3.5" />
              {isPendingProfile ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Segurança e Alteração de Senha */}
      <Card className="p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Shield className="h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Segurança & Senha
            </h2>
            <p className="text-xs text-text-muted">Altere sua senha de acesso à conta.</p>
          </div>
        </div>

        <form ref={passwordFormRef} action={passwordAction} className="mt-4 space-y-4">
          {passwordState.error && (
            <div className="flex items-center gap-2 rounded-xl bg-expense/10 p-3 text-xs font-semibold text-expense">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{passwordState.error}</span>
            </div>
          )}

          {passwordState.success && (
            <div className="flex items-center gap-2 rounded-xl bg-income/10 p-3 text-xs font-semibold text-income">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Senha alterada com sucesso!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Nova Senha
              </label>
              <input
                type="password"
                name="nova_senha"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                name="confirmacao"
                placeholder="Repita a nova senha"
                required
                minLength={6}
                className="w-full rounded-xl border border-border-strong bg-paper-raised px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPendingPassword}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {isPendingPassword ? "Atualizando..." : "Alterar Senha"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Aparência e Tema */}
      <Card className="p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Moon className="h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Aparência da Interface
            </h2>
            <p className="text-xs text-text-muted">Personalize a exibição visual do seu aplicativo.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-primary">Tema da Interface</p>
            <p className="text-xs text-text-muted">Alterne entre modo Claro, Escuro ou Automático do Sistema.</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      {/* 4. Preferências Regionais & Moeda */}
      <Card className="p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <DollarSign className="h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Moeda & Região
            </h2>
            <p className="text-xs text-text-muted">Padrões de cálculo e exibição de valores.</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
          <div>
            <label className="text-xs font-semibold uppercase text-text-muted">Moeda Principal</label>
            <p className="mt-1 font-semibold text-text-primary">Real Brasileiro (BRL - R$)</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-text-muted">Formato de Data</label>
            <p className="mt-1 font-semibold text-text-primary">DD/MM/AAAA (Padrão Nacional)</p>
          </div>
        </div>
      </Card>

      {/* 5. Central de Dados & Exportação */}
      <Card className="p-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Database className="h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-base font-semibold text-text-primary">
              Seus Dados Financeiros
            </h2>
            <p className="text-xs text-text-muted">Exportações e backup das suas informações.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">Exportar Extratos & Relatórios</p>
            <p className="text-xs text-text-muted">Baixe planilhas em Excel, CSV ou relatórios impressos em PDF.</p>
          </div>
          <a href="/relatorios">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Download className="h-3.5 w-3.5" />
              Ir para Exportação
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
