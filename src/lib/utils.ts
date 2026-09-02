import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata um valor numérico como moeda em Real (BRL). */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Formata uma data ISO no padrão dd/mm/aaaa. */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

/** Retorna o sinal (+/-) e a cor semântica para um valor de transação. */
export function getAmountTone(type: "receita" | "despesa" | "transferencia") {
  if (type === "receita") return { sign: "+", tone: "income" as const };
  if (type === "despesa") return { sign: "-", tone: "expense" as const };
  return { sign: "", tone: "info" as const };
}

/**
 * Converte um valor digitado em formato BR ("1.250,50" ou "25,00") para número.
 * Centralizado aqui para evitar duplicação nos arquivos de actions.
 */
export function parseValorBR(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  return Number(normalized);
}
