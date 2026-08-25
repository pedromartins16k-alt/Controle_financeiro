"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { MOBILE_NAV_ITEMS } from "./nav-items";
import { useTransactionModal } from "@/components/transactions/transaction-modal-context";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { open } = useTransactionModal();
  const [left, right] = [MOBILE_NAV_ITEMS.slice(0, 2), MOBILE_NAV_ITEMS.slice(2)];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-paper-raised px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {left.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}

      <button
        onClick={open}
        aria-label="Adicionar transação"
        className="relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-paper-raised shadow-lg shadow-brand/30 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {right.map((item) => (
        <NavLink key={item.href} item={item} active={pathname === item.href} />
      ))}
    </nav>
  );
}

function NavLink({
  item,
  active,
}: {
  item: (typeof MOBILE_NAV_ITEMS)[number];
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-1 text-[11px]",
        active ? "text-brand" : "text-text-muted"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      {item.label}
    </Link>
  );
}
