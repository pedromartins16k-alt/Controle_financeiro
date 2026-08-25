"use client";
/* eslint-disable react-hooks/set-state-in-effect --
   Padrão necessário do next-themes: o valor do tema só existe no cliente,
   então usamos esse efeito só para evitar mismatch de hidratação SSR/CSR. */

import * as React from "react";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: MonitorSmartphone },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-[108px] rounded-full bg-paper-raised" />;
  }

  return (
    <div
      role="radiogroup"
      aria-label="Selecionar tema"
      className="flex items-center gap-0.5 rounded-full border border-border bg-paper-raised p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            theme === value
              ? "bg-brand text-paper-raised"
              : "text-text-muted hover:text-text-primary"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
