"use client";

import * as React from "react";
import { CreditCard as CardIcon, Wifi } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { CreditCardRow } from "@/lib/types";

export function CartaoVisual({ card }: { card: CreditCardRow }) {
  const limiteDisponivel = Math.max(0, card.limite - card.faturaAtual);
  const pctUsado = Math.min(100, Math.max(0, (card.faturaAtual / (card.limite || 1)) * 100));

  return (
    <div
      style={{
        background: linear-gradient(135deg,  0%, #0d1217 100%),
      }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.02]",
        "border border-white/10 aspect-[1.586/1] min-h-[220px]"
      )}
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

      {/* Top Header: Bank + Contactless */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">
            {card.banco || "Cartão de Crédito"}
          </span>
          <h3 className="font-display text-lg font-medium text-white">{card.nome}</h3>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <Wifi className="h-5 w-5 rotate-90" strokeWidth={2} />
          <CardIcon className="h-6 w-6 opacity-70" strokeWidth={1.5} />
        </div>
      </div>

      {/* Center: Chip & Card Number */}
      <div className="my-auto">
        <div className="mb-3 flex items-center gap-3">
          {/* EMV Chip Visual */}
          <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-amber-300 to-amber-100 p-1 shadow-inner">
            <div className="h-full w-full rounded border border-amber-600/40 bg-amber-200/50" />
          </div>
        </div>
        <p className="font-mono text-sm tracking-widest text-white/90">
          •••• •••• •••• {card.ultimosDigitos || "••••"}
        </p>
      </div>

      {/* Bottom: Limits & Progress */}
      <div className="space-y-2">
        <div className="flex items-end justify-between text-xs">
          <div>
            <p className="text-white/60">Fatura atual</p>
            <p className="font-mono font-medium text-white">{formatCurrency(card.faturaAtual)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60">Disponível</p>
            <p className="font-mono font-medium text-emerald-400">
              {formatCurrency(limiteDisponivel)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pctUsado > 85 ? "bg-rose-500" : pctUsado > 60 ? "bg-amber-400" : "bg-emerald-400"
            )}
            style={{ width: ${pctUsado}% }}
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-white/70">
          <span>Fecha dia {card.diaFechamento}</span>
          <span>Vence dia {card.diaVencimento}</span>
        </div>
      </div>
    </div>
  );
}
