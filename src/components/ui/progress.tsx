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
    tone === "alert" ? "bg-alert" : tone === "expense" ? "bg-expense" : "bg-brand";

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-paper", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", toneClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
