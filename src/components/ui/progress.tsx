import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  tone = "brand",
  className,
}: {
  value: number; // 0-100
  tone?: "brand" | "alert" | "expense";
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  
  const toneClass =
    tone === "expense"
      ? "bg-gradient-to-r from-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.6)]"
      : tone === "alert"
      ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
      : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.6)]";

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-black/40 border border-white/5", className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-700 ease-out", toneClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
