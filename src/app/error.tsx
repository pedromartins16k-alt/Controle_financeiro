"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20">
        <AlertCircle className="h-8 w-8 strokeWidth={2.5}" />
      </div>
      <h2 className="font-display text-xl font-bold text-text-primary md:text-2xl mb-2">
        Não conseguimos carregar seus dados financeiros
      </h2>
      <p className="max-w-md text-sm text-text-muted mb-6">
        Ocorreu uma instabilidade ao carregar suas informações. Suas movimentações continuam seguras.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
