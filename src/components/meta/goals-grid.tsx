use client;

import { useState } from react;
import { Plus, Target, Pencil, Trash2, CheckCircle2, TrendingUp, Calendar } from lucide-react;
import { Button } from @/components/ui/button;
import { Card } from @/components/ui/card;
import { Progress } from @/components/ui/progress;
import { formatCurrency } from @/lib/utils;
import { GoalModal } from @/components/meta/goal-modal;
import { deleteGoal, depositToGoal } from @/lib/supabase/budget-goal-actions;
import type { DetailedGoalRow } from @/lib/types;

interface GoalsGridProps {
  goals: DetailedGoalRow[];
}

export function GoalsGrid({ goals }: GoalsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DetailedGoalRow | null>(null);
  const [depositModalGoal, setDepositModalGoal] = useState<DetailedGoalRow | null>(null);
  const [depositValue, setDepositValue] = useState(");
 const [isDepositing, setIsDepositing] = useState(false);

 const totalObjetivo = goals.reduce((acc, g) => acc + g.valorObjetivo, 0);
 const totalGuardado = goals.reduce((acc, g) => acc + g.valorAtual, 0);
 const totalConcluidas = goals.filter((g) => g.concluida).length;

 const handleEdit = (goal: DetailedGoalRow) => {
 setEditingGoal(goal);
 setIsModalOpen(true);
 };

 const handleCreate = () => {
 setEditingGoal(null);
 setIsModalOpen(true);
 };

 const handleDelete = async (id: string, nome: string) => {
 if (confirm(Deseja realmente excluir a meta ?)) {
 await deleteGoal(id);
 }
 };

 const handleConfirmDeposit = async () => {
 if (!depositModalGoal) return;
 const valor = Number(depositValue.replace(/\./g, ).replace(,, .));
 if (!valor || valor <= 0) return alert(Informe um valor válido);

 setIsDepositing(true);
 await depositToGoal(depositModalGoal.id, valor);
 setIsDepositing(false);
 setDepositModalGoal(null);
 setDepositValue();
 };

 return (
 <>
 <div className=space-y-6>
 {/* Banner de Estatísticas das Metas */}
 <div className=grid grid-cols-1 gap-4 md:grid-cols-3>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Total Planejado em Metas
 </span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-text-primary>
 {formatCurrency(totalObjetivo)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Total Já Conquistado
 </span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-brand>
 {formatCurrency(totalGuardado)}
 </p>
 </Card>
 <Card className=p-5>
 <span className=text-xs font-medium text-text-secondary uppercase>
 Metas Concluídas
 </span>
 <p className=mt-2 text-2xl font-bold tracking-tight text-text-primary>
 {totalConcluidas} de {goals.length}
 </p>
 </Card>
 </div>

 {/* Cabeçalho da Lista e Botão Adicionar */}
 <div className=flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between>
 <div>
 <h2 className=text-lg font-semibold text-text-primary>
 Seus Objetivos & Metas
 </h2>
 <p className=text-xs text-text-secondary>
 Acompanhe seu progresso de economia para viagens, compras e reservas.
 </p>
 </div>
 <Button onClick={handleCreate} className=gap-2 self-start sm:self-auto>
 <Plus className=h-4 w-4 />
 Nova Meta
 </Button>
 </div>

 {/* Estado Vazio */}
 {goals.length === 0 ? (
 <div className=flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center>
 <div className=flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand>
 <Target className=h-7 w-7 />
 </div>
 <h3 className=mt-4 text-base font-semibold text-text-primary>
 Nenhuma meta cadastrada
 </h3>
 <p className=mt-1 max-w-sm text-sm text-text-secondary>
 Crie objetivos com valores e datas para poupar com foco e disciplina financeira.
 </p>
 <Button onClick={handleCreate} className=mt-5 gap-2>
 <Plus className=h-4 w-4 />
 Criar primeira meta
 </Button>
 </div>
 ) : (
 /* Grid de Cards de Metas */
 <div className=grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3>
 {goals.map((g) => {
 const isCompleted = g.concluida || g.percentual >= 100;

 return (
 <Card
 key={g.id}
 className=relative flex flex-col justify-between p-5 transition-shadow hover:shadow-md
 >
 <div>
 <div className=flex items-start justify-between>
 <div className=flex items-center gap-3>
 <div
 className=flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-xs
 style={{ backgroundColor: g.cor || #10b981 }}
 >
 <Target className=h-5 w-5 />
 </div>
 <div>
 <div className=flex items-center gap-2>
 <h4 className=font-semibold text-text-primary>
 {g.nome}
 </h4>
 {isCompleted && (
 <CheckCircle2 className=h-4 w-4 text-brand />
 )}
 </div>
 {g.prazo && (
 <div className=flex items-center gap-1 text-xs text-text-muted>
 <Calendar className=h-3 w-3 />
 <span>Até {g.prazo}</span>
 </div>
 )}
 </div>
 </div>

 <div className=flex items-center gap-1>
 <button
 onClick={() => handleEdit(g)}
 className=rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary
 title=Editar
 >
 <Pencil className=h-4 w-4 />
 </button>
 <button
 onClick={() => handleDelete(g.id, g.nome)}
 className=rounded-lg p-1.5 text-text-muted hover:bg-surface-elevated hover:text-expense
 title=Excluir
 >
 <Trash2 className=h-4 w-4 />
 </button>
 </div>
 </div>

 {g.descricao && (
 <p className=mt-3 text-xs text-text-secondary line-clamp-2>
 {g.descricao}
 </p>
 )}

 <div className=mt-5>
 <div className=mb-2 flex items-baseline justify-between text-xs>
 <span className=font-medium text-text-secondary>
 Guardado:{ }
 <strong className=text-text-primary>
 {formatCurrency(g.valorAtual)}
 </strong>{ }
 / {formatCurrency(g.valorObjetivo)}
 </span>
 <span className=font-semibold tabular-data text-brand>
 {g.percentual.toFixed(0)}%
 </span>
 </div>
 <Progress value={g.percentual} tone=brand />
 </div>
 </div>

 <div className=mt-5 border-t border-border/50 pt-3>
 <div className=flex items-center justify-between text-xs>
 {isCompleted ? (
 <span className=font-semibold text-brand>
 🎉 Meta atingida com sucesso!
 </span>
 ) : (
 <div>
 <span className=text-text-muted>Faltam: </span>
 <span className=font-medium text-text-primary>
 {formatCurrency(g.valorRestante)}
 </span>
 {g.sugestaoMensal && (
 <span className=block text-[10px] text-text-muted>
 (~{formatCurrency(g.sugestaoMensal)} / mês)
 </span>
 )}
 </div>
 )}

 {!isCompleted && (
 <button
 onClick={() => setDepositModalGoal(g)}
 className=flex items-center gap-1 rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/20
 >
 <TrendingUp className=h-3 w-3 />
 + Guardar
 </button>
 )}
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>

 <GoalModal
 isOpen={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 editingGoal={editingGoal}
 />

 {/* Modal Rápido de Depósito/Poupar */}
 {depositModalGoal && (
 <div className=fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs>
 <div className=relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl>
 <h3 className=text-lg font-semibold text-text-primary>
 Guardar para: {depositModalGoal.nome}
 </h3>
 <p className=mt-1 text-xs text-text-secondary>
 Quanto você gostaria de adicionar a este objetivo hoje?
 </p>

 <div className=mt-4>
 <label className=block text-xs font-medium text-text-secondary uppercase>
 Valor do Aporte (R$)
 </label>
 <input
 type=text
 value={depositValue}
 onChange={(e) => setDepositValue(e.target.value)}
 placeholder=Ex: 250,00
 autoFocus
 className=mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand
 />
 </div>

 <div className=mt-6 flex justify-end gap-2>
 <Button
 variant=outline
 size=sm
 onClick={() => setDepositModalGoal(null)}
 disabled={isDepositing}
 >
 Cancelar
 </Button>
 <Button
 size=sm
 onClick={handleConfirmDeposit}
 disabled={isDepositing}
 >
 {isDepositing ? Salvando... : Confirmar Aporte}
 </Button>
 </div>
 </div>
 </div>
 )}
 </>
 );
}
