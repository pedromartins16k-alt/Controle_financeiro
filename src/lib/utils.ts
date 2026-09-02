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

export interface InterpretedTransaction {
  descricao: string;
  valor: number | null;
  tipo: "receita" | "despesa";
  categoriaSugerida?: string;
}

/**
 * Interpreta texto em linguagem natural como:
 * - "mercado 89,90"
 * - "uber 25"
 * - "salario 4500"
 * - "aluguel 1200"
 */
export function parseNaturalLanguageTransaction(input: string): InterpretedTransaction | null {
  const text = input.trim();
  if (!text) return null;

  // Encontra padrão de valor no texto (ex: 89,90 ou 1250.50 ou 45)
  const match = text.match(/(?:R\$\s*)?(\d+(?:[.,]\d{1,2})?)(?!\w)/i);
  if (!match) return null;

  const rawValue = match[1];
  const valor = parseValorBR(rawValue);
  if (!Number.isFinite(valor) || valor <= 0) return null;

  // A descrição é o texto restante sem o valor
  let descricao = text.replace(match[0], "").trim();
  descricao = descricao.replace(/^(no|na|com|de|para|em)\s+/i, "");
  if (!descricao) descricao = "Transação sem nome";
  descricao = descricao.charAt(0).toUpperCase() + descricao.slice(1);

  const lower = text.toLowerCase();
  let tipo: "receita" | "despesa" = "despesa";
  let categoriaSugerida = "Outros";

  if (
    lower.includes("salario") ||
    lower.includes("salário") ||
    lower.includes("recebi") ||
    lower.includes("freelance") ||
    lower.includes("renda") ||
    lower.includes("pix recebido") ||
    lower.includes("venda")
  ) {
    tipo = "receita";
    categoriaSugerida = "Renda";
  } else if (
    lower.includes("mercado") ||
    lower.includes("feira") ||
    lower.includes("almoço") ||
    lower.includes("almoco") ||
    lower.includes("jantar") ||
    lower.includes("lanche") ||
    lower.includes("ifood") ||
    lower.includes("restaurante")
  ) {
    categoriaSugerida = "Alimentação";
  } else if (
    lower.includes("uber") ||
    lower.includes("gasolina") ||
    lower.includes("combustivel") ||
    lower.includes("combustível") ||
    lower.includes("estacionamento") ||
    lower.includes("onibus") ||
    lower.includes("ônibus") ||
    lower.includes("metro") ||
    lower.includes("metrô")
  ) {
    categoriaSugerida = "Transporte";
  } else if (
    lower.includes("farmacia") ||
    lower.includes("farmácia") ||
    lower.includes("medico") ||
    lower.includes("médico") ||
    lower.includes("remedio") ||
    lower.includes("remédio") ||
    lower.includes("consulta")
  ) {
    categoriaSugerida = "Saúde";
  } else if (
    lower.includes("aluguel") ||
    lower.includes("condominio") ||
    lower.includes("condomínio") ||
    lower.includes("luz") ||
    lower.includes("agua") ||
    lower.includes("água") ||
    lower.includes("internet")
  ) {
    categoriaSugerida = "Moradia";
  } else if (
    lower.includes("cinema") ||
    lower.includes("show") ||
    lower.includes("bar") ||
    lower.includes("cerveja") ||
    lower.includes("festa") ||
    lower.includes("passeio") ||
    lower.includes("jogo")
  ) {
    categoriaSugerida = "Lazer";
  }

  return {
    descricao,
    valor,
    tipo,
    categoriaSugerida,
  };
}
