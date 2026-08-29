use client;

import { useState } from react;
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Calendar as CalendarIcon } from lucide-react;
import { Card, CardHeader, CardTitle } from @/components/ui/card;
import { Button } from @/components/ui/button;
import { formatCurrency, formatDate } from @/lib/utils;

interface CalendarViewProps {
  transactions: any[];
}

export function CalendarView({ transactions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat(pt-BR, { month: long, year: numeric }).format(currentDate);

  // Mapear transações por data 'YYYY-MM-DD'
  const txByDay: Record<string, { receitas: number; despesas: number; items: any[] }> = {};

  transactions.forEach((t) => {
    const dayKey = t.data;
    if (!txByDay[dayKey]) {
      txByDay[dayKey] = { receitas: 0, despesas: 0, items: [] };
    }
    if (t.tipo === receita) {
      txByDay[dayKey].receitas += Number(t.valor);
    } else if (t.tipo === despesa) {
      txByDay[dayKey].despesas += Number(t.valor);
    }
    txByDay[dayKey].items.push(t);
  });

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const daysOfWeek = [Dom, Seg, Ter, Qua, Qui, Sex, Sáb];

  return (
    <div className=space-y-6>
      {/* Navegação de Mês */}
      <div className=flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between>
        <div className=flex items-center gap-3>
          <h2 className=text-xl font-bold capitalize text-text-primary>{monthName}</h2>
          <Button variant=outline size=sm onClick={todayMonth}>Hoje</Button>
        </div>
        <div className=flex items-center gap-2>
          <Button variant=outline size=sm onClick={prevMonth} className=h-9 w-9 p-0>
            <ChevronLeft className=h-4 w-4 />
          </Button>
          <Button variant=outline size=sm onClick={nextMonth} className=h-9 w-9 p-0>
            <ChevronRight className=h-4 w-4 />
          </Button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <Card className=overflow-hidden p-4>
        {/* Cabeçalho dos dias da semana */}
        <div className=grid grid-cols-7 gap-1 border-b border-border pb-2 text-center text-xs font-semibold uppercase text-text-muted>
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className=mt-2 grid grid-cols-7 gap-1>
          {/* Espaços vazios do início do mês */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={empty-} className=min-h-[90px] rounded-lg bg-paper/30 p-2 />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const dateStr = ${year}--;
            const dayData = txByDay[dateStr];
            const isToday =
              new Date().toISOString().slice(0, 10) === dateStr;
            const isSelected = selectedDay === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={min-h-[90px] cursor-pointer rounded-lg border p-2 transition-colors }
              >
                <div className=flex items-center justify-between>
                  <span
                    className={lex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold }
                  >
                    {dayNumber}
                  </span>
                  {dayData && (
                    <span className=text-[10px] text-text-muted>
                      {dayData.items.length} lanc.
                    </span>
                  )}
                </div>

                {dayData && (
                  <div className=mt-2 space-y-1>
                    {dayData.receitas > 0 && (
                      <div className=truncate text-[11px] font-medium tabular-data text-income>
                        +{formatCurrency(dayData.receitas)}
                      </div>
                    )}
                    {dayData.despesas > 0 && (
                      <div className=truncate text-[11px] font-medium tabular-data text-expense>
                        -{formatCurrency(dayData.despesas)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detalhamento do Dia Selecionado */}
      {selectedDay && (
        <Card className=p-5>
          <CardHeader>
            <CardTitle className=text-base font-semibold text-text-primary>
              Movimentações em {formatDate(selectedDay)}
            </CardTitle>
          </CardHeader>

          {(!txByDay[selectedDay] || txByDay[selectedDay].items.length === 0) ? (
            <p className=py-4 text-sm text-text-muted>
              Nenhuma receita ou despesa registrada para este dia.
            </p>
          ) : (
            <div className=divide-y divide-border/60>
              {txByDay[selectedDay].items.map((t) => (
                <div key={t.id} className=flex items-center justify-between py-3>
                  <div>
                    <p className=text-sm font-medium text-text-primary>{t.descricao}</p>
                    <p className=text-xs text-text-muted capitalize>
                      {t.forma_pagamento || Sem forma} · {t.tipo}
                    </p>
                  </div>
                  <span
                    className={ont-semibold tabular-data }
                  >
                    {t.tipo === receita ? + : -} {formatCurrency(t.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
