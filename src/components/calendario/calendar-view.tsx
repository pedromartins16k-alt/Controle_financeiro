"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle2,
  Clock,
  Plus,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";

interface CreditCardInfo {
  id: string;
  nome: string;
  dia_vencimento: number;
  dia_fechamento: number;
  cor?: string;
}

interface CalendarViewProps {
  transactions: any[];
  cards?: CreditCardInfo[];
}

export function CalendarView({ transactions, cards = [] }: CalendarViewProps) {
  const { open: openNewTransaction } = useTransactionModal();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(currentDate);

  // Mapear transações por data 'YYYY-MM-DD'
  const txByDay: Record<string, { receitas: number; despesas: number; agendadas: number; items: any[] }> = {};

  let totalMesReceitas = 0;
  let totalMesDespesas = 0;
  let totalMesAgendadas = 0;

  transactions.forEach((t) => {
    const dayKey = t.data;
    const isThisMonth = dayKey && dayKey.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);

    if (!txByDay[dayKey]) {
      txByDay[dayKey] = { receitas: 0, despesas: 0, agendadas: 0, items: [] };
    }

    const valor = Number(t.valor);

    if (t.status === "agendada") {
      txByDay[dayKey].agendadas += valor;
      if (isThisMonth && t.tipo === "despesa") totalMesAgendadas += valor;
    } else {
      if (t.tipo === "receita") {
        txByDay[dayKey].receitas += valor;
        if (isThisMonth) totalMesReceitas += valor;
      } else if (t.tipo === "despesa") {
        txByDay[dayKey].despesas += valor;
        if (isThisMonth) totalMesDespesas += valor;
      }
    }
    txByDay[dayKey].items.push(t);
  });

  const saldoPrevistoMes = totalMesReceitas - (totalMesDespesas + totalMesAgendadas);

  // Data de hoje
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayDateStr);

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Mapear vencimentos de cartões no mês
  const cardEventsByDay: Record<number, { vencimentos: CreditCardInfo[]; fechamentos: CreditCardInfo[] }> = {};
  cards.forEach((c) => {
    if (c.dia_vencimento) {
      if (!cardEventsByDay[c.dia_vencimento]) cardEventsByDay[c.dia_vencimento] = { vencimentos: [], fechamentos: [] };
      cardEventsByDay[c.dia_vencimento].vencimentos.push(c);
    }
    if (c.dia_fechamento) {
      if (!cardEventsByDay[c.dia_fechamento]) cardEventsByDay[c.dia_fechamento] = { vencimentos: [], fechamentos: [] };
      cardEventsByDay[c.dia_fechamento].fechamentos.push(c);
    }
  });

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro do Mês Selecionado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Receitas Efetivadas</p>
          <p className="mt-1 font-display text-lg font-bold text-income tabular-data">
            + {formatCurrency(totalMesReceitas)}
          </p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Despesas Efetivadas</p>
          <p className="mt-1 font-display text-lg font-bold text-expense tabular-data">
            - {formatCurrency(totalMesDespesas)}
          </p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Despesas Agendadas</p>
          <p className="mt-1 font-display text-lg font-bold text-amber-500 tabular-data">
            {formatCurrency(totalMesAgendadas)}
          </p>
        </Card>

        <Card className="p-3.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Saldo Previsto</p>
          <p className={`mt-1 font-display text-lg font-bold tabular-data ${saldoPrevistoMes >= 0 ? "text-income" : "text-expense"}`}>
            {formatCurrency(saldoPrevistoMes)}
          </p>
        </Card>
      </div>

      {/* Navegação de Mês */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold capitalize text-text-primary">{monthName}</h2>
          <Button variant="outline" size="sm" onClick={todayMonth} className="text-xs h-8">Hoje</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <Card className="overflow-hidden p-3.5 sm:p-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 border-b border-border pb-2 text-center text-xs font-semibold uppercase text-text-muted">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className="mt-2 grid grid-cols-7 gap-1">
          {/* Espaços vazios do início do mês */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] rounded-xl bg-paper-raised/30 p-1.5 opacity-40" />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
            const dayData = txByDay[dateStr];
            const isToday = todayDateStr === dateStr;
            const isSelected = selectedDay === dateStr;

            const cardEvents = cardEventsByDay[dayNumber];

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={`min-h-[85px] sm:min-h-[95px] cursor-pointer rounded-xl border p-1.5 sm:p-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-brand bg-brand/10 shadow-sm"
                    : isToday
                    ? "border-brand-soft bg-paper-raised"
                    : "border-border/60 bg-paper/60 hover:border-border hover:bg-paper-raised/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-bold ${
                      isToday
                        ? "bg-brand text-paper-raised"
                        : isSelected
                        ? "text-brand"
                        : "text-text-primary"
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Badges de Vencimento de Cartão */}
                  {cardEvents && cardEvents.vencimentos.length > 0 && (
                    <span
                      title={`Vencimento fatura: ${cardEvents.vencimentos.map(c => c.nome).join(", ")}`}
                      className="flex h-4 w-4 items-center justify-center rounded bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    >
                      <CreditCard className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {/* Movimentações do Dia */}
                <div className="space-y-0.5 mt-1">
                  {dayData && dayData.receitas > 0 && (
                    <div className="truncate text-[10px] sm:text-[11px] font-semibold tabular-data text-income">
                      +{formatCurrency(dayData.receitas)}
                    </div>
                  )}
                  {dayData && dayData.despesas > 0 && (
                    <div className="truncate text-[10px] sm:text-[11px] font-semibold tabular-data text-expense">
                      -{formatCurrency(dayData.despesas)}
                    </div>
                  )}
                  {dayData && dayData.agendadas > 0 && (
                    <div className="truncate text-[9px] sm:text-[10px] font-medium tabular-data text-amber-500">
                      ~{formatCurrency(dayData.agendadas)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detalhamento do Dia Selecionado */}
      {selectedDay && (
        <Card className="p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-brand" />
              <h3 className="font-display text-base font-semibold text-text-primary">
                Movimentações em {formatDate(selectedDay)}
              </h3>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={openNewTransaction}
              className="gap-1 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              Lançar
            </Button>
          </div>

          {/* Vencimentos de Cartão no dia */}
          {(() => {
            const dayNum = Number(selectedDay.split("-")[2]);
            const events = cardEventsByDay[dayNum];
            if (!events || events.vencimentos.length === 0) return null;
            return (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                <p className="font-semibold flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Vencimento de Fatura
                </p>
                <p className="mt-0.5 text-text-secondary">
                  Cartão(ões): {events.vencimentos.map((c) => c.nome).join(", ")}
                </p>
              </div>
            );
          })()}

          {/* Lista de Transações */}
          {(!txByDay[selectedDay] || txByDay[selectedDay].items.length === 0) ? (
            <p className="py-6 text-center text-sm text-text-muted">
              Nenhuma receita ou despesa registrada para este dia.
            </p>
          ) : (
            <div className="divide-y divide-border/60 mt-2">
              {txByDay[selectedDay].items.map((t) => {
                const isExpense = t.tipo === "despesa";
                const isScheduled = t.status === "agendada";

                return (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isExpense ? "bg-expense/10 text-expense" : "bg-income/10 text-income"
                        }`}
                      >
                        {isExpense ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text-primary">{t.descricao}</p>
                          {isScheduled && (
                            <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.2 text-[10px] font-bold text-amber-500">
                              <Clock className="h-2.5 w-2.5" />
                              Agendada
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted capitalize">
                          {t.forma_pagamento || "Sem forma"} · {t.tipo}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-semibold tabular-data text-sm ${
                        isExpense ? "text-expense" : "text-income"
                      }`}
                    >
                      {isExpense ? "- " : "+ "}
                      {formatCurrency(Number(t.valor))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
