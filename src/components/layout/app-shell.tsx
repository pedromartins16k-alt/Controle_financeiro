use client;

import { useState } from react;
import { Sidebar } from ./sidebar;
import { Topbar } from ./topbar;
import { TransactionModalProvider } from @/components/transactions/transaction-modal-context;
import { TransactionModal } from @/components/transactions/transaction-modal;

export function AppShell({
  children,
  userName = Pedro,
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <TransactionModalProvider>
      <div className=flex min-h-screen bg-paper>
        {/* Menu Lateral Desktop e Gaveta Mobile */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className=flex min-w-0 flex-1 flex-col>
          <Topbar
            userName={userName}
            onMenuClick={() => setMobileMenuOpen(true)}
          />
          <main className=flex-1 px-3.5 pb-16 pt-4 md:px-8 md:pb-10 md:pt-6>
            {children}
          </main>
        </div>
      </div>
      <TransactionModal />
    </TransactionModalProvider>
  );
}
