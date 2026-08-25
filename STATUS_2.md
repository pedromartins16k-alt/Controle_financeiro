# STATUS_2 — Controle Financeiro Pessoal

## Etapa concluída: 2 — Autenticação + banco de dados real

### O que foi criado

- **Cliente Supabase** (`@supabase/ssr`): `src/lib/supabase/client.ts` (browser),
  `src/lib/supabase/server.ts` (Server Components/Actions),
  `src/lib/supabase/middleware.ts` (renovação de sessão).
- **`middleware.ts`** na raiz: protege todas as rotas — usuário não
  logado é redirecionado para `/login` (guardando a rota de destino em
  `?redirect=`); usuário já logado que tenta acessar `/login` ou
  `/cadastro` é redirecionado para `/`.
- **Autenticação completa** via Server Actions
  (`src/lib/supabase/actions.ts`): `login`, `signup`, `logout`,
  `requestPasswordReset`.
  - `/login` — formulário com erros tratados (credenciais inválidas,
    email não confirmado).
  - `/cadastro` — cria a conta (o trigger `on_auth_user_created` já
    existente no banco cria a linha em `profiles` automaticamente).
  - `/esqueci-senha` — envia link de redefinição por email.
  - `/redefinir-senha` — tela que recebe o link e troca a senha
    (usa client-side `supabase.auth.updateUser`, já que precisa da
    sessão temporária criada pelo link).
  - `/auth/callback` — Route Handler que troca o código do link de
    email por uma sessão válida.
- **Logout** — botão na sidebar (rodapé, acima do "Recolher").
- **Dashboard virou Server Component** (`src/app/page.tsx`): busca o
  usuário logado, redireciona pra `/login` se não houver sessão, busca
  o nome em `profiles`, e chama `getDashboardData` para os números reais.
- **`src/lib/dashboard-data.ts`**: calcula, a partir das tabelas reais
  do Supabase —
  - Saldo atual e variação vs. mês anterior (soma do saldo inicial das
    contas + receitas − despesas efetivadas do período).
  - Receitas/despesas do mês + variação percentual vs. mês anterior.
  - Economia do mês e % da renda economizada.
  - Evolução dos últimos 6 meses (receitas x despesas).
  - Gastos por categoria do mês (cor vem da própria categoria cadastrada).
  - 6 transações mais recentes.
  - Orçamentos do mês (cruzando limite cadastrado com gasto real da
    categoria).
  - Metas ativas (não concluídas).
  - Todas as queries filtram explicitamente por `user_id` (defesa em
    profundidade — o RLS já isola por usuário, mas o filtro explícito
    evita depender só dele).
- **Estados vazios reais**: como as tabelas começam zeradas para um
  usuário novo, `CategoryBreakdown`, `BudgetsPreview` e `GoalsPreview`
  agora mostram mensagem + call-to-action quando não há dados (antes só
  `RecentTransactions` tinha isso).
- **`src/lib/types.ts`**: tipos do dashboard centralizados — os
  componentes não dependem mais de `mock-data.ts` para tipagem
  (`mock-data.ts` continua no projeto só como referência/exemplo, mas
  não é mais importado em lugar nenhum).

### Onde foi criado

Mesmo repositório: `pedromartins16k-alt/controle-financeiro`, branch `main`.

### Como funciona

- Sem usuário logado → qualquer rota redireciona pra `/login`.
- Cadastro cria o usuário no Supabase Auth → o trigger do banco cria o
  perfil → usuário confirma o email (fluxo padrão do Supabase) → login
  → dashboard com todos os números zerados (nenhuma conta/transação
  cadastrada ainda) e o aviso "você ainda não cadastrou nenhuma conta".
- A partir daqui, qualquer dado que for inserido direto no Supabase
  (ou pelas telas que ainda vamos construir) aparece automaticamente
  no dashboard — não há mais dado mockado no caminho principal.

### Variável de ambiente nova

`NEXT_PUBLIC_SITE_URL` — usada para montar o link de redefinição de
senha enviado por email. Em produção (Vercel), troque pela URL real do
deploy; localmente pode deixar `http://localhost:3000`.

### O que falta (próximas etapas)

- **Etapa 3**: Página de Transações + modal "Nova transação" funcional
  (o botão já existe na topbar e no bottom nav, hoje só loga no
  console).
- **Etapa 4**: Contas (CRUD) — o link "Adicionar conta" no aviso do
  dashboard ainda não tem página de destino funcional.
- **Etapa 5**: Cartões de crédito + Faturas.
- **Etapa 6**: Categorias (gerenciamento — hoje só lê as 14 categorias
  padrão já existentes).
- **Etapa 7**: Orçamentos (CRUD real).
- **Etapa 8**: Metas financeiras (CRUD real).
- **Etapa 9**: Transações recorrentes + parcelamentos.
- **Etapa 10**: Relatórios + exportação.
- **Etapa 11**: Busca global + filtros avançados.
- **Etapa 12**: Notificações + calendário financeiro.
- **Etapa 13**: Perfil/configurações + onboarding inicial (a tabela
  `profiles` já tem `onboarding_concluido`, ainda não é usado em
  nenhuma tela).
- **Etapa 14**: IA (chat de análise financeira).

### Como testar

1. Copie `.env.local.example` para `.env.local` (já vem com a URL e a
   chave anon do projeto `controle-financeiro` preenchidas — são
   públicas por natureza, protegidas pelo RLS do banco).
2. `npm install && npm run dev`
3. Acesse `/cadastro`, crie uma conta, confirme o email (verifique
   também spam), faça login.
4. Confirme que o dashboard carrega com tudo zerado + o aviso de
   "nenhuma conta cadastrada".
5. Teste o logout na sidebar.
6. Teste "Esqueceu a senha?" e o link recebido por email.
