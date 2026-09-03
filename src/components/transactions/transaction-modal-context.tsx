"use client";

import * as React from "react";
import type { TransactionRow } from "@/lib/types";

interface TransactionModalContextValue {
  isOpen: boolean;
  editingTransaction: TransactionRow | null;
  open: () => void;
  openEdit: (transaction: TransactionRow) => void;
  close: () => void;
}

const TransactionModalContext = React.createContext<TransactionModalContextValue | null>(
  null
);

export function TransactionModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<TransactionRow | null>(null);

  const value = React.useMemo(
    () => ({
      isOpen,
      editingTransaction,
      open: () => {
        setEditingTransaction(null);
        setIsOpen(true);
      },
      openEdit: (transaction: TransactionRow) => {
        setEditingTransaction(transaction);
        setIsOpen(true);
      },
      close: () => {
        setIsOpen(false);
        setEditingTransaction(null);
      },
    }),
    [isOpen, editingTransaction]
  );

  return (
    <TransactionModalContext.Provider value={value}>
      {children}
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  const ctx = React.useContext(TransactionModalContext);
  if (!ctx) {
    throw new Error("useTransactionModal deve ser usado dentro de TransactionModalProvider");
  }
  return ctx;
}
