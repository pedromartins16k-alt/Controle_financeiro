import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "income" | "expense" | "alert" | "info" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
  alert: "bg-alert-soft text-alert",
  info: "bg-info-soft text-info",
  neutral: "bg-paper text-text-secondary",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    />
  );
}
