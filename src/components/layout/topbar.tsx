"use client";

import { Bell, Plus, Menu, Search } from "lucide-react";
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
  onSearchClick?: () => void;
}

export function Topbar({ userName, onMenuClick, onSearchClick }: TopbarProps) {
  const { open } = useTransactionModal();
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0a0f0d]/75 px-3.5 backdrop-blur-xl md:h-16 md:px-8">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Botão Hambúrguer no Celular */}
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu lateral"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary md:hidden"
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

      {/* Barra de Busca Rápida Central / Desktop */}
      <div className="hidden lg:flex flex-1 max-w-xs mx-4">
        <button
          onClick={onSearchClick}
          className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs text-text-muted hover:border-emerald-500/40 hover:text-text-primary transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-emerald-400" />
            <span>Buscar no app...</span>
          </div>
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono border border-white/10 text-text-muted">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Ícone de Busca no Mobile/Tablet */}
        <button
          onClick={onSearchClick}
          aria-label="Buscar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary lg:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        <Button
          onClick={open}
          size="sm"
          className="hidden sm:inline-flex gap-1.5 h-8.5 rounded-full px-4 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.4)] transition-all md:h-9 md:text-sm"
        >
          <Plus className="h-4 w-4 strokeWidth={2.5}" />
          Nova transação
        </Button>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <a
          href="/notificacoes"
          aria-label="Notificações"
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-black/30 text-text-secondary transition-colors hover:bg-white/[0.06] hover:text-text-primary md:h-9 md:w-9"
        >
          <Bell className="h-4 w-4 strokeWidth={2}" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </a>
        <a
          href="/configuracoes"
          aria-label="Perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/60 font-display text-xs font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] md:h-9 md:w-9 md:text-sm"
        >
          {userName.charAt(0).toUpperCase()}
        </a>
      </div>
    </header>
  );
}
