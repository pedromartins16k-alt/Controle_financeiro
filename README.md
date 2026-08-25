# Meu Dinheiro — Controle Financeiro Pessoal

Plataforma web para controle financeiro pessoal: receitas, despesas, contas,
cartões de crédito, orçamentos, metas e relatórios.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (tokens de design em `src/app/globals.css`)
- **Recharts** para gráficos
- **next-themes** para tema claro/escuro/sistema
- **Supabase** (Postgres + Auth + RLS) — projeto `controle-financeiro`
  (ref: `hpdiwgqqwgqokummxcto`)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

```
src/
  app/                    Rotas (App Router)
  components/
    ui/                   Primitivos reutilizáveis (Button, Card, Badge, Progress)
    layout/                Sidebar, Topbar, BottomNav, AppShell
    dashboard/             Cards e gráficos do dashboard
    theme-provider.tsx      Wrapper do next-themes
    theme-toggle.tsx        Alternador claro/escuro/sistema
  lib/
    utils.ts                Helpers (cn, formatCurrency, formatDate)
    mock-data.ts             Dados de exemplo (Etapa 1 — sem banco ainda)
```

## Status do projeto

Veja `STATUS_1.md` para o progresso detalhado e os próximos passos.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com as chaves do
Supabase (Configurações → API no painel do projeto).
