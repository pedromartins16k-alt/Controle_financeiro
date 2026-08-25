"use client";

import * as React from "react";

interface TransactionModalContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const TransactionModalContext = React.createContext<TransactionModalContextValue | null>(
  null
);

export function TransactionModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
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
