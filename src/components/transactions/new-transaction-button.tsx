"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionModal } from "./transaction-modal-context";

export function NewTransactionButton() {
  const { open } = useTransactionModal();
  return (
    <Button onClick={open} size="sm">
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      Nova transação
    </Button>
  );
}
