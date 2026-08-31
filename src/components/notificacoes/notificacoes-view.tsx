"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  PieChart,
  Target,
  Info,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface NotificationItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "alerta" | "urgente" | "sucesso" | "info";
  categoria: "cartao" | "orcamento" | "meta" | "sistema";
  data: string;
  href?: string;
  linkText?: string;
}

export function NotificacoesView({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const [filter, setFilter] = React.useState<string>("todas");

  const filteredItems = React.useMemo(() => {
    if (filter === "todas") return notifications;
    if (filter === "alertas") return notifications.filter((n) => n.tipo === "alerta" || n.tipo === "urgente");
    if (filter === "cartao") return notifications.filter((n) => n.categoria === "cartao");
    if (filter === "orcamento") return notifications.filter((n) => n.categoria === "orcamento");
    if (filter === "meta") return notifications.filter((n) => n.categoria === "meta");
    return notifications;
  }, [notifications, filter]);

  const countAlertas = notifications.filter((n) => n.tipo === "alerta" || n.tipo === "urgente").length;

  return (
    <div className="space-y-5">
      {/* Filtros em Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-paper-raised p-1 w-fit">
        <button
          onClick={() => setFilter("todas")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === "todas"
              ? "bg-brand text-paper-raised"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Todas ({notifications.length})
        </button>

        <button
          onClick={() => setFilter("alertas")}
          className={`relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === "alertas"
              ? "bg-expense text-paper-raised"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Alertas Urgentes ({countAlertas})
        </button>

        <button
          onClick={() => setFilter("cartao")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === "cartao"
              ? "bg-brand text-paper-raised"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Cartões
        </button>

        <button
          onClick={() => setFilter("orcamento")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === "orcamento"
              ? "bg-brand text-paper-raised"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Orçamentos
        </button>

        <button
          onClick={() => setFilter("meta")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === "meta"
              ? "bg-brand text-paper-raised"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Metas
        </button>
      </div>

      {/* Lista de Notificações */}
      {filteredItems.length === 0 ? (
        <Card className="py-12 text-center text-text-muted">
          <Info className="mx-auto h-8 w-8 text-text-muted/60 mb-2" />
          <p className="text-sm font-medium">Nenhuma notificação encontrada nesta categoria.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((n) => {
            const isAlert = n.tipo === "alerta" || n.tipo === "urgente";
            const isSuccess = n.tipo === "sucesso";

            return (
              <Card
                key={n.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 transition-all ${
                  n.tipo === "urgente"
                    ? "border-expense/40 bg-expense/5"
                    : isAlert
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "hover:border-border-strong"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      n.tipo === "urgente"
                        ? "bg-expense/15 text-expense"
                        : isAlert
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : isSuccess
                        ? "bg-income/15 text-income"
                        : "bg-brand/15 text-brand"
                    }`}
                  >
                    {n.categoria === "cartao" ? (
                      <CreditCard className="h-5 w-5" />
                    ) : n.categoria === "orcamento" ? (
                      <PieChart className="h-5 w-5" />
                    ) : n.categoria === "meta" ? (
                      <Target className="h-5 w-5" />
                    ) : isAlert ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : isSuccess ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Info className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {n.titulo}
                      </h3>
                      {n.tipo === "urgente" && (
                        <span className="rounded-full bg-expense/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-expense">
                          Crítico
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                      {n.descricao}
                    </p>
                    <span className="mt-1.5 inline-block text-[11px] text-text-muted">
                      {n.data}
                    </span>
                  </div>
                </div>

                {/* Botão de Ação Rápida */}
                {n.href && (
                  <Link href={n.href} className="self-end sm:self-center shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <span>{n.linkText || "Ver detalhes"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
