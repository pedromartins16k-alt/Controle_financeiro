"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { TransactionModalProvider } from "@/components/transactions/transaction-modal-context";
import { TransactionModal } from "@/components/transactions/transaction-modal";

export function AppShell({
  children,
  userName = "Pedro",
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  return (
    <TransactionModalProvider>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar userName={userName} />
          <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
        </div>
        <BottomNav />
      </div>
      <TransactionModal />
    </TransactionModalProvider>
  );
}
