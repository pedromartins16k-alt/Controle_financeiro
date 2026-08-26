# STATUS_4 — Controle Financeiro Pessoal

## Etapa concluída: 4 — Gestão de Contas Bancárias

### O que foi criado

- **Página /contas** (src/app/contas/page.tsx):
  - Listagem de todas as contas bancárias ativas e inativas do usuário.
  - Cálculo dinâmico do saldo atual consolidando saldo inicial + receitas - despesas - transferências.
- **Server Actions de Contas** (src/lib/supabase/account-actions.ts):
  - createAccount, updateAccount, deleteAccount.
  - Validação de saldo inicial em formato brasileiro ("1.250,50").
- **Componentes visuais** (src/components/conta/):
  - contas-grid.tsx: Grid moderno com cards por conta, ícones coloridos e ações de edição/exclusão.
  - contas-modal.tsx: Modal para criação e edição de contas com seletor de tipo, ícone e cor.
- **Tipagem**: Interface AccountRow adicionada em src/lib/types.ts.
