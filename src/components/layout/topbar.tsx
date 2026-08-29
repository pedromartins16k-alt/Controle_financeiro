"use client";

import { Bell, Plus, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";

const GREETINGS = ["Bom dia", "Boa tarde", "Boa noite"];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return GREETINGS[0];
  if (hour < 18) return GREETINGS[1];
  return GREETINGS[2];
}

interface TopbarProps {
  userName: string;
  onMenuClick?: () => void;
}

export function Topbar({ userName, onMenuClick }: TopbarProps) {
  const { open } = useTransactionModal();
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-paper/90 px-3 backdrop-blur md:h-16 md:px-8">
      <div className="flex items-center gap-2 min-w-0">
        {/* Botão Hambúrguer no Celular */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu lateral"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-paper-raised hover:text-text-primary md:hidden"
        >
          <Menu className="h-5 w-5 strokeWidth={2}" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-text-primary md:text-sm">
            {getGreeting()}, {userName}
          </p>
          <p className="truncate text-[10px] capitalize text-text-muted md:text-xs">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <Button onClick={open} size="sm" className="hidden sm:inline-flex gap-1 h-8 text-xs md:h-9 md:text-sm">
          <Plus className="h-3.5 w-3.5 strokeWidth={2.5}" />
          Nova transação
        </Button>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <a
          href="/notificacoes"
          aria-label="Notificações"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-paper-raised hover:text-text-primary md:h-9 md:w-9"
        >
          <Bell className="h-4 w-4 strokeWidth={2}" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-expense" />
        </a>
        <a
          href="/configuracoes"
          aria-label="Perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft font-display text-xs font-medium text-brand-strong dark:text-brand md:h-9 md:w-9 md:text-sm"
        >
          {userName.charAt(0).toUpperCase()}
        </a>
      </div>
    </header>
  );
}
