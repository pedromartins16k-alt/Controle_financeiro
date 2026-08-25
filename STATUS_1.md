# STATUS_1 — Controle Financeiro Pessoal

## Etapa concluída: 1 — Estrutura, design system e layout

### O que foi criado

- Projeto Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, com
  ESLint e build de produção validados (0 erros).
- **Design system** em `src/app/globals.css`: paleta "Razão Financeira"
  (papel neutro-frio + verde-pinho `--brand`, vermelho-tijolo `--expense`,
  âmbar `--alert`, azul `--info`), tipografia Fraunces (números grandes) +
  Manrope (UI) + IBM Plex Mono (dados tabulares), tema claro/escuro completo
  via classe `.dark`, foco visível e `prefers-reduced-motion` respeitado.
- **Layout responsivo**: sidebar colapsável no desktop
  (`src/components/layout/sidebar.tsx`), barra de navegação inferior no
  mobile com botão flutuante de "+ Nova transação"
  (`src/components/layout/bottom-nav.tsx`), topbar com saudação, data,
  notificações e alternador de tema (`src/components/layout/topbar.tsx`).
  Tudo unificado em `src/components/layout/app-shell.tsx`.
- **Componentes de UI reutilizáveis**: `Button`, `Card`, `Badge`, `Progress`
  em `src/components/ui/`.
- **Dashboard principal** (`src/app/page.tsx`) com dados mockados
  (`src/lib/mock-data.ts`):
  - Cards de resumo (saldo, receitas, despesas, economia) com variação
    percentual vs. mês anterior.
  - Gráfico de evolução financeira (receitas x despesas) com seletor de
    período (7D/30D/6M/1A — período ainda não filtra os dados de verdade).
  - Gráfico de gastos por categoria (donut) com total no centro.
  - Lista de transações recentes com indicador de cor lateral
    (verde=receita, vermelho=despesa) e estado vazio já tratado.
  - Prévia de orçamentos com barra de progresso e alertas de 80%/100%.
  - Prévia de metas financeiras com barra de progresso.

### Onde foi criado

Repositório: `pedromartins16k-alt/controle-financeiro` (branch `main`).

### Como funciona

- Todo o dashboard usa dados de `src/lib/mock-data.ts` — nenhuma leitura
  real do Supabase ainda. Isso é proposital (Etapa 1 = layout).
- O botão "+ Nova transação" (topbar e bottom nav) só loga no console por
  enquanto — o modal entra na Etapa 3.
- As rotas do menu (`/transacoes`, `/contas`, `/cartoes` etc.) ainda não
  existem como páginas — só os links da sidebar/bottom nav já apontam pra
  lá, prontos para a Etapa 2 em diante.

### O que falta (próximas etapas, na ordem do plano original)

- **Etapa 2**: Autenticação (Supabase Auth) + conexão real com o banco
  `controle-financeiro` (ref `hpdiwgqqwgqokummxcto`), isolando dados por
  usuário via RLS (as tabelas já existem: `profiles`, `categories`,
  `accounts`, `credit_cards`, `invoices`, `transactions`, `budgets`,
  `goals`, `recurring_transactions`, `installments`, `notifications`).
- **Etapa 3**: Página de Transações + modal "Nova transação" funcional.
- **Etapa 4**: Contas.
- **Etapa 5**: Cartões de crédito + Faturas.
- **Etapa 6**: Categorias (gerenciamento).
- **Etapa 7**: Orçamentos (CRUD real).
- **Etapa 8**: Metas financeiras (CRUD real).
- **Etapa 9**: Transações recorrentes + parcelamentos.
- **Etapa 10**: Relatórios + exportação (PDF/CSV/Excel).
- **Etapa 11**: Busca global + filtros avançados.
- **Etapa 12**: Notificações + calendário financeiro.
- **Etapa 13**: Perfil/configurações + onboarding inicial.
- **Etapa 14**: IA (chat de análise financeira, no molde do `chat-ia` do
  Vestibular+, usando Gemini).

### Como testar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`. Teste:
- Redimensionar a janela — sidebar vira bottom nav abaixo de `md` (768px).
- Recolher a sidebar pelo botão no rodapé dela.
- Alternar tema claro/escuro/sistema no topbar (desktop) — no mobile o
  alternador ainda não está exposto, só o tema do sistema é aplicado
  automaticamente.
- Navegar pelo teclado (Tab) — o foco deve ficar sempre visível.
