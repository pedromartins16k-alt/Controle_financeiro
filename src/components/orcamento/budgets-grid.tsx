use client;

import { useState } from react;
import { Plus, Wallet, Pencil, Trash2, AlertTriangle, AlertCircle } from lucide-react;
import { Button } from @/components/ui/button;
import { Card } from @/components/ui/card;
import { Progress } from @/components/ui/progress;
import { formatCurrency } from @/lib/utils;
import { BudgetModal } from @/components/orcamento/budget-modal;
import { deleteBudget } from @/lib/supabase/budget-goal-actions;
import type { CategoryRow, DetailedBudgetRow } from @/lib/types;

interface BudgetsGridProps {
  budgets: DetailedBudgetRow[];
  categories: CategoryRow[];
}

export function BudgetsGrid({ budgets, categories }: BudgetsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<DetailedBudgetRow | null>(null);

  const totalLimite = budgets.reduce((acc, b) => acc + b.valorLimite, 0);
  const totalGasto = budgets.reduce((acc, b) => acc + b.valorGasto, 0);
  const percentualTotal = totalLimite > 0 ? (totalGasto / totalLimite) * 100 : 0;

  const handleEdit = (budget: DetailedBudgetRow) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, categoriaNome: string) => {
    if (confirm(Deseja realmente excluir o orçamento de "?)) {
 await deleteBudget(id);
 }
 };

 return (
 <>
 <div className=space-y-6>
 {/* Banner de Resumo Geral dos Orçamentos */}
 <div className=grid grid-cols-1 gap-4 md:grid-cols-3>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Teto Total Planejado
 </span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-text-primary>
 {formatCurrency(totalLimite)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Total Consumido
 </span>
 <p className={mt-2 text-2xl font-bold tracking-tight }>
 {formatCurrency(totalGasto)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Saldo Restante
 </span>
 <p className={mt-2 text-2xl font-bold tracking-tight }>
 {formatCurrency(totalLimite - totalGasto)}
 </p>
 </Card>
 </div>

 {/* Cabeçalho da Lista e Botão Adicionar */}
 <div className=flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between>
 <div>
 <h2 className=text-lg font-semibold text-text-primary>
 Orçamentos por Categoria
 </h2>
 <p className=text-xs text-text-secondary>
 Acompanhe o consumo dos seus limites e evite estourar as contas no fim do mês.
 </p>
 </div>
 <Button onClick={handleCreate} className=gap-2 self-start sm:self-auto>
 <Plus className=h-4 w-4 />
 Novo Orçamento
 </Button>
 </div>

 {/* Estado Vazio */}
 {budgets.length === 0 ? (
 <div className=flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center>
 <div className=flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand>
 <Wallet className=h-7 w-7 />
 </div>
 <h3 className=mt-4 text-base font-semibold text-text-primary>
 Nenhum orçamento cadastrado
 </h3>
 <p className=mt-1 max-w-sm text-sm text-text-secondary>
 Defina limites de gastos para categorias como Alimentação, Transporte e Lazer para manter suas finanças no azul.
 </p>
 <Button onClick={handleCreate} className=mt-5 gap-2>
 <Plus className=h-4 w-4 />
 Criar meu primeiro orçamento
 </Button>
 </div>
 ) : (
 /* Grid de Cards de Orçamento */
 <div className=grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3>
 {budgets.map((b) => {
 const isOver = b.percentualGasto > 100;
 const isNear = !isOver && b.percentualGasto >= 80;
 const restante = b.valorLimite - b.valorGasto;

 return (
 <Card key={b.id} className=relative flex flex-col justify-between p-5 transition-shadow hover:shadow-md>
 <div>
 <div className=flex items-start justify-between>
 <div className=flex items-center gap-3>
 <div
 className=flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white text-xs
 style={{ backgroundColor: b.categoriaCor || #10b981 }}
 >
 {b.categoriaNome.slice(0, 2).toUpperCase()}
 </div>
 <div>
 <h4 className=font-semibold text-text-primary>
 {b.categoriaNome}
 </h4>
 <span className=text-xs text-text-muted>
 Limite: {formatCurrency(b.valorLimite)}
 </span>
 </div>
 </div>

 <div className=flex items-center gap-1>
 <button
 onClick={() => handleEdit(b)}
 className=rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary
 title=Editar
 >
 <Pencil className=h-4 w-4 />
 </button>
 <button
 onClick={() => handleDelete(b.id, b.categoriaNome)}
 className=rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-expense
 title=Excluir
 >
 <Trash2 className=h-4 w-4 />
 </button>
 </div>
 </div>

 <div className=mt-5>
 <div className=mb-2 flex items-baseline justify-between text-xs>
 <span className=font-medium text-text-secondary>
 Gasto atual: <strong className=text-text-primary>{formatCurrency(b.valorGasto)}</strong>
 </span>
 <span className={ont-semibold tabular-data }>
 {b.percentualGasto.toFixed(0)}%
 </span>
 </div>
 <Progress
 value={b.percentualGasto}
 tone={isOver ? expense : isNear ? alert : brand}
 />
 </div>
 </div>

 <div className=mt-4 border-t border-border/50 pt-3>
 {isOver ? (
 <div className=flex items-center gap-1.5 text-xs text-expense>
 <AlertCircle className=h-4 w-4 shrink-0 />
 <span>Ultrapassou em {formatCurrency(Math.abs(restante))}</span>
 </div>
 ) : isNear ? (
 <div className=flex items-center gap-1.5 text-xs text-alert>
 <AlertTriangle className=h-4 w-4 shrink-0 />
 <span>Atenção: restam apenas {formatCurrency(restante)}</span>
 </div>
 ) : (
 <div className=flex items-center justify-between text-xs text-text-secondary>
 <span>Disponível para gastar:</span>
 <span className=font-semibold text-brand>{formatCurrency(restante)}</span>
 </div>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>

 <BudgetModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 categories={categories}
 editingBudget={editingBudget}
 />
 </>
 );
}
