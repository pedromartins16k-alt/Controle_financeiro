"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, type OnboardingData } from "@/lib/supabase/onboarding-actions";
import { Wallet, Target, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingData>({
    nome: "",
    rendaMensal: 0,
    banco: "",
    saldoInicial: 0,
    meta: "",
    metaValor: 0,
  });

  const updateForm = (field: keyof OnboardingData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.nome) return setError("Por favor, informe seu nome.");
    if (step === 2 && !formData.banco) return setError("Por favor, informe o nome do banco.");
    
    setError(null);
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    const result = await completeOnboarding(formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-border bg-paper-raised shadow-xl">
      <div className="bg-brand/5 p-6 text-center border-b border-border">
        <h2 className="text-xl font-bold text-brand">Bem-vindo(a) ao Controle Financeiro</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Passo {step} de 3
        </p>
        <div className="mt-4 flex gap-2 justify-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-colors ${
                i <= step ? "bg-brand" : "bg-border-strong"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-md bg-expense/10 p-3 text-sm text-expense">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Como podemos te chamar?</h3>
              <p className="text-sm text-text-secondary mb-4">Vamos personalizar seu painel.</p>
              
              <label className="block text-sm font-medium text-text-primary mb-1">Seu Nome</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) => updateForm("nome", e.target.value)}
                className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 outline-none focus:border-brand"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Renda Mensal Aproximada</label>
              <p className="text-xs text-text-muted mb-2">Isso ajuda a calcular indicadores de economia.</p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-text-muted">R$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.rendaMensal || ""}
                  onChange={(e) => updateForm("rendaMensal", Number(e.target.value))}
                  className="w-full rounded-md border border-border-strong bg-paper pl-9 pr-3 py-2 outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Sua conta principal</h3>
              <p className="text-sm text-text-secondary mb-4">Para começar a controlar, adicione sua conta bancária onde recebe seu dinheiro.</p>
              
              <label className="block text-sm font-medium text-text-primary mb-1">Nome do Banco / Conta</label>
              <input
                type="text"
                placeholder="Ex: Nubank, Itaú, Dinheiro..."
                value={formData.banco}
                onChange={(e) => updateForm("banco", e.target.value)}
                className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 outline-none focus:border-brand"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Saldo Atual</label>
              <p className="text-xs text-text-muted mb-2">Qual o valor disponível hoje nessa conta?</p>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-text-muted">R$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.saldoInicial || ""}
                  onChange={(e) => updateForm("saldoInicial", Number(e.target.value))}
                  className="w-full rounded-md border border-border-strong bg-paper pl-9 pr-3 py-2 outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Qual o seu maior objetivo?</h3>
              <p className="text-sm text-text-secondary mb-4">Mapear um objetivo te ajuda a poupar. Pode preencher ou pular.</p>
              
              <label className="block text-sm font-medium text-text-primary mb-1">Nome da Meta (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Reserva de Emergência, Comprar Carro"
                value={formData.meta}
                onChange={(e) => updateForm("meta", e.target.value)}
                className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 outline-none focus:border-brand"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Valor Objetivo</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-text-muted">R$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.metaValor || ""}
                  onChange={(e) => updateForm("metaValor", Number(e.target.value))}
                  className="w-full rounded-md border border-border-strong bg-paper pl-9 pr-3 py-2 outline-none focus:border-brand"
                  disabled={!formData.meta}
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3 border-t border-border pt-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              disabled={loading}
              className="flex items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium hover:bg-border disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
