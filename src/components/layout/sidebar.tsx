"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Wallet2, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <>
      {/* Overlay escurecido no celular */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-white/[0.08] bg-[#060a08]/90 text-paper backdrop-blur-2xl transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:z-0 md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[70px]" : "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              <Wallet2 className="h-4 w-4 text-black strokeWidth={2.5}" />
            </div>
            {(!collapsed || mobileOpen) && (
              <span className="font-display text-base font-bold tracking-tight text-white">
                Meu&nbsp;Dinheiro
              </span>
            )}
          </div>

          {/* Botão fechar no celular */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="rounded-md p-1.5 text-paper/60 hover:bg-white/10 hover:text-paper md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3 aria-label=Navegação principal">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all",
                  active
                    ? "bg-emerald-500/15 font-semibold text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white border border-transparent"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-4 w-4 shrink-0 strokeWidth={2}", active && "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]")} />
                {(!collapsed || mobileOpen) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-2.5 py-2">
          <LogoutButton collapsed={collapsed && !mobileOpen} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="mt-1 hidden h-8 w-full items-center justify-center gap-2 rounded-md text-paper/50 transition-colors hover:bg-white/5 hover:text-paper md:flex"
          >
            <ChevronsLeft
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")}
            />
            {!collapsed && <span className="text-xs">Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
