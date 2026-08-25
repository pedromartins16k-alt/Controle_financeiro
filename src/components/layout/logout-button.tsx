"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/supabase/actions";

export function LogoutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        title="Sair"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/60 transition-colors hover:bg-white/5 hover:text-paper"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
        {!collapsed && <span>Sair</span>}
      </button>
    </form>
  );
}
