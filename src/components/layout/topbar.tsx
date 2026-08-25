"use client";

import { Bell, Plus } from "lucide-react";
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

export function Topbar({ userName }: { userName: string }) {
  const { open } = useTransactionModal();
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-paper/80 px-4 backdrop-blur md:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">
          {getGreeting()}, {userName}
        </p>
        <p className="truncate text-xs capitalize text-text-muted">{today}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={open} size="sm" className="hidden sm:inline-flex">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nova transação
        </Button>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-paper-raised hover:text-text-primary"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-expense" />
        </button>
        <div
          aria-label="Perfil"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-medium text-brand-strong dark:text-brand"
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
