"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createGoal, updateGoal, type BudgetGoalFormState } from "@/lib/supabase/budget-goal-actions";
import type { DetailedGoalRow } from "@/lib/types";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: DetailedGoalRow | null;
}

const CORES = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

export function GoalModal({ isOpen, onClose, editingGoal }: GoalModalProps) {
  const [state, formAction, isPending] = useActionState<BudgetGoalFormState, FormData>(
    editingGoal ? updateGoal : createGoal,
    {}
  );

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorObjetivo, setValorObjetivo] = useState("");
  const [valorAtual, setValorAtual] = useState("0");
  const [prazo, setPrazo] = useState("");
  const [cor, setCor] = useState(CORES[0]);

  useEffect(() => {
    if (editingGoal) {
      setNome(editingGoal.nome);
      setDescricao(editingGoal.descricao || "");
      setValorObjetivo(editingGoal.valorObjetivo.toString());
      setValorAtual(editingGoal.valorAtual.toString());
      setPrazo(editingGoal.prazo || "");
      setCor(editingGoal.cor || CORES[0]);
    } else {
      setNome("");
      setDescricao("");
      setValorObjetivo("");
      setValorAtual("0");
      setPrazo("");
      setCor(CORES[0]);
    }
  }, [editingGoal, isOpen]);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-text-primary">
          {editingGoal ? "Editar Meta Financeira" : "Nova Meta Financeira"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Defina seu sonho (reserva de emergência, viagem, carro) e acompanhe o progresso.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {editingGoal && <input type="hidden" name="id" value={editingGoal.id} />}

          {state.error && (
            <div className="rounded-lg bg-expense/10 p-3 text-xs font-medium text-expense">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase">
              Título da Meta
            </label>
            <input
              type="text"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Viagem de Férias, Comprar Notebook"
              required
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase">
                Valor Objetivo (R$)
              </label>
              <input
                type="text"
                name="valor_objetivo"
                value={valorObjetivo}
                onChange={(e) => setValorObjetivo(e.target.value)}
                placeholder="Ex: 5.000,00"
                required
                className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase">
                Já Guardado (R$)
              </label>
              <input
                type="text"
                name="valor_atual"
                value={valorAtual}
                onChange={(e) => setValorAtual(e.target.value)}
                placeholder="Ex: 1.200,00"
                className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase">
                Data Limite (Prazo)
              </label>
              <input
                type="date"
                name="prazo"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary uppercase">
                Cor Identificadora
              </label>
              <div className="mt-2 flex items-center gap-2">
                {CORES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      cor === c ? "scale-125 border-text-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input type="hidden" name="cor" value={cor} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase">
              Observação / Descrição
            </label>
            <textarea
              name="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Alguma nota sobre a meta..."
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingGoal ? "Salvar Alterações" : "Criar Meta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
