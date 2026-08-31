"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TransactionModalProvider } from "@/components/transactions/transaction-modal-context";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { GlobalSearchDialog } from "@/components/search/global-search-dialog";

export function AppShell({
  children,
  userName = "Pedro",
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Listener global para atalho Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <TransactionModalProvider>
      <div className="flex min-h-screen bg-paper">
        {/* Menu Lateral Desktop e Gaveta Mobile */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            userName={userName}
            onMenuClick={() => setMobileMenuOpen(true)}
            onSearchClick={() => setSearchOpen(true)}
          />
          <main className="flex-1 px-3.5 pb-16 pt-4 md:px-8 md:pb-10 md:pt-6">
            {children}
          </main>
        </div>
      </div>
      <TransactionModal />
      <GlobalSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </TransactionModalProvider>
  );
}
