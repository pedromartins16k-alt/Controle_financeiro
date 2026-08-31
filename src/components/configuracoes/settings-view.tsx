"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  User,
  Shield,
  Moon,
  DollarSign,
  Calendar,
  Database,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  Download,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  updateProfile,
  updatePassword,
  type SettingsState,
} from "@/lib/supabase/settings-actions";

const MOEDAS = [
  { code: "BRL", label: "Real Brasileiro (BRL - R$)", symbol: "R$" },
  { code: "USD", label: "Dólar Americano (USD - $)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR - €)", symbol: "€" },
  { code: "GBP", label: "Libra Esterlina (GBP - £)", symbol: "£" },
];

const FORMATOS_DATA = [
  { code: "DD/MM/YYYY", label: "DD/MM/AAAA (ex: 31/08/2026)", desc: "Padrão Nacional (Brasil)" },
  { code: "YYYY-MM-DD", label: "AAAA-MM-DD (ex: 2026-08-31)", desc: "Padrão Internacional ISO" },
  { code: "MM/DD/YYYY", label: "MM/DD/AAAA (ex: 08/31/2026)", desc: "Padrão Americano" },
];

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

  // Estados de Moeda e Data persistidos no cliente (localStorage)
  const [moeda, setMoeda] = React.useState("BRL");
  const [formatoData, setFormatoData] = React.useState("DD/MM/YYYY");
  const [savedPreferences, setSavedPreferences] = React.useState(false);

  React.useEffect(() => {
    const savedM = localStorage.getItem("pref_moeda");
    const savedD = localStorage.getItem("pref_formato_data");
    if (savedM) setMoeda(savedM);
    if (savedD) setFormatoData(savedD);
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("pref_moeda", moeda);
    localStorage.setItem("pref_formato_data", formatoData);
    setSavedPreferences(true);
    setTimeout(() => setSavedPreferences(false), 3000);
  };

  React.useEffect(() => {
    if (passwordState.success) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* 1. Dados do Perfil (Editável) */}
      <Card className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <User className="h-5 w-5" />
            </div>
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

            <div className="space-y-3">
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
        </div>
      </Card>

      {/* 2. Segurança e Alteração de Senha */}
      <Card className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Shield className="h-5 w-5" />
            </div>
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

            <div className="space-y-3">
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
        </div>
      </Card>

      {/* 3. Moeda & Região (Interativo com Seletores) */}
      <Card className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Moeda & Formato de Data
              </h2>
              <p className="text-xs text-text-muted">Personalize a moeda padrão e a exibição de datas.</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="mt-4 space-y-4">
            {savedPreferences && (
              <div className="flex items-center gap-2 rounded-xl bg-income/10 p-3 text-xs font-semibold text-income">
                <Check className="h-4 w-4 shrink-0" />
                <span>Preferências regionais salvas com sucesso!</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Moeda Principal
                </label>
                <select
                  value={moeda}
                  onChange={(e) => setMoeda(e.target.value)}
                  className="w-full rounded-xl border border-border-strong bg-paper-raised px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand"
                >
                  {MOEDAS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Formato de Data
                </label>
                <select
                  value={formatoData}
                  onChange={(e) => setFormatoData(e.target.value)}
                  className="w-full rounded-xl border border-border-strong bg-paper-raised px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand"
                >
                  {FORMATOS_DATA.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.label} — {f.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="gap-1.5 text-xs h-9">
                <Save className="h-3.5 w-3.5" />
                Salvar Preferências
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* 4. Aparência & Exportação */}
      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Aparência da Interface
              </h2>
              <p className="text-xs text-text-muted">Alterne entre o modo Claro, Escuro ou Sistema.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Tema Ativo</p>
            <ThemeToggle />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-text-primary">
                Seus Dados Financeiros
              </h2>
              <p className="text-xs text-text-muted">Exportações completas dos seus lançamentos.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-text-secondary">Exportar em Excel, CSV e PDF</p>
            <a href="/relatorios">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Download className="h-3.5 w-3.5" />
                Ir para Exportação
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
