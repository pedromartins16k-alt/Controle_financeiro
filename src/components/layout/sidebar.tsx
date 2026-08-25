"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Wallet2 } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-ink text-paper transition-[width] duration-200 md:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand">
          <Wallet2 className="h-4.5 w-4.5 text-paper-raised" strokeWidth={2} />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-medium tracking-tight">
            Meu&nbsp;Dinheiro
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/10 font-medium text-paper"
                  : "text-paper/60 hover:bg-white/5 hover:text-paper"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-2">
        <LogoutButton collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-md text-paper/50 transition-colors hover:bg-white/5 hover:text-paper"
        >
          <ChevronsLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span className="text-xs">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
