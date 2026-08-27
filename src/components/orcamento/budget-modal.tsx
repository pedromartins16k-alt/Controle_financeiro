"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertBudget, type BudgetGoalFormState } from "@/lib/supabase/budget-goal-actions";
import type { CategoryRow, DetailedBudgetRow } from "@/lib/types";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRow[];
  editingBudget?: DetailedBudgetRow | null;
}

export function BudgetModal({
  isOpen,
  onClose,
  categories,
  editingBudget,
}: BudgetModalProps) {
  const [state, formAction, isPending] = useActionState<BudgetGoalFormState, FormData>(
    upsertBudget,
    {}
  );

  const [categoriaId, setCategoriaId] = useState("");
  const [valorLimite, setValorLimite] = useState("");
  const [mesReferencia, setMesReferencia] = useState(
    new Date().toISOString().slice(0, 7) + "-01"
  );

  useEffect(() => {
    if (editingBudget) {
      setCategoriaId(editingBudget.categoriaId);
      setValorLimite(editingBudget.valorLimite.toString());
      setMesReferencia(editingBudget.mesReferencia || new Date().toISOString().slice(0, 7) + "-01");
    } else {
      setCategoriaId(categories[0]?.id || "");
      setValorLimite("");
      setMesReferencia(new Date().toISOString().slice(0, 7) + "-01");
    }
  }, [editingBudget, categories, isOpen]);

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-text-muted hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-text-primary">
          {editingBudget ? "Editar Orçamento" : "Novo Orçamento Mensal"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Defina um teto de gastos para controlar melhor suas despesas.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          {editingBudget && (
            <input type="hidden" name="id" value={editingBudget.id} />
          )}

          {state.error && (
            <div className="rounded-lg bg-expense/10 p-3 text-xs font-medium text-expense">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase">
              Categoria
            </label>
            <select
              name="categoria_id"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
            >
              <option value="" disabled>
                Selecione uma categoria
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase">
              Limite Mensal (R$)
            </label>
            <input
              type="text"
              name="valor_limite"
              value={valorLimite}
              onChange={(e) => setValorLimite(e.target.value)}
              placeholder="Ex: 800,00"
              required
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase">
              Mês de Referência
            </label>
            <input
              type="date"
              name="mes_referencia"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
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
              {editingBudget ? "Salvar Alterações" : "Criar Orçamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
