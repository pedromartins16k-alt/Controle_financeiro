# STATUS_3 — Controle Financeiro Pessoal

## Etapa concluída: 3 — Página de Transações + modal "Nova transação"

### O que foi criado

- **Modal "Nova transação"** (`src/components/transactions/transaction-modal.tsx`),
  acessível de **qualquer página** através de um contexto React
  (`transaction-modal-context.tsx` + `TransactionModalProvider`, montado
  uma vez dentro do `AppShell`):
  - Seletor de tipo (Despesa/Receita/Transferência) com cor semântica.
  - Fluxo rápido: valor + data lado a lado, descrição, categoria (filtrada
    pelo tipo selecionado — busca as categorias padrão + as do usuário),
    conta, forma de pagamento, observação opcional.
  - Transferência troca os campos automaticamente para conta de origem +
    conta de destino (exige as duas, e valida que não sejam a mesma).
  - Categorias e contas são carregadas do Supabase no momento em que o
    modal abre (client-side), então sempre refletem o que existe no
    banco — sem precisar prefetch em cada página.
  - Ao salvar com sucesso: fecha o modal, reseta o formulário e chama
    `router.refresh()` — a página por trás (dashboard, transações, o
    que for) atualiza sozinha com o dado novo.
- **Server Actions** (`src/lib/supabase/transaction-actions.ts`):
  - `createTransaction` — valida tipo, descrição, valor (aceita "25,00"
    ou "1.250,50"), forma de pagamento e as regras de transferência;
    insere sempre com o `user_id` da sessão (nunca confia em dado vindo
    do client).
  - `deleteTransaction` — apaga só se `user_id` bater com o dono da
    sessão (mesmo já protegido por RLS).
- **Página `/transacoes`** (`src/app/transacoes/page.tsx`):
  - Lista até 200 transações do usuário, mais recentes primeiro.
  - Filtro por tipo (Todas/Receitas/Despesas/Transferências) e busca por
    descrição — ambos via query string (`?tipo=&q=`), então são
    compartilháveis e voltam com o botão "voltar" do navegador.
  - Cada linha tem cor lateral por tipo (verde/vermelho/azul) e botão de
    excluir (aparece no hover/foco, pede confirmação).
  - Estado vazio com call-to-action pra abrir o modal.
  - Botão "+ Nova transação" próprio no cabeçalho (desktop), além do
    botão já existente na topbar/bottom nav — todos abrem o mesmo modal.
- O botão de adicionar transação na **topbar** e no **bottom nav** agora
  abre o modal de verdade (antes só logava no console).
- O empty-state de "Transações recentes" no dashboard também abre o
  modal.

### Onde foi criado

Mesmo repositório: `pedromartins16k-alt/controle-financeiro`, branch `main`.

### Como funciona

- O modal não sabe em que página está — ele só existe uma vez, dentro
  do `AppShell`, e qualquer parte da UI pede pra abrir através do hook
  `useTransactionModal()`.
- Depois de criar uma transação, tanto o dashboard quanto `/transacoes`
  mostram o dado novo automaticamente (Server Components + `router.refresh()`
  + `revalidatePath`).
- Transações ainda não ficam ligadas a cartão de crédito/fatura — isso
  é a Etapa 5. Por enquanto, mesmo escolhendo "Crédito" como forma de
  pagamento, a transação não gera fatura (o campo existe no banco, a
  lógica de fatura ainda não).
- Transações recorrentes: o checkbox "Recorrente?" do documento original
  foi **propositalmente deixado de fora** deste modal — implementar
  isso direito exige o motor de recorrência da Etapa 9. Adicionar o
  checkbox agora sem a lógica por trás criaria uma promessa que o app
  não cumpre.

### O que falta (próximas etapas)

- **Etapa 4**: Contas (CRUD) — hoje dá pra escolher uma conta ao criar
  transação, mas não tem tela pra cadastrar contas.
- **Etapa 5**: Cartões de crédito + Faturas.
- **Etapa 6**: Categorias (gerenciamento — criar/editar/cores/ícones).
- **Etapa 7**: Orçamentos (CRUD real).
- **Etapa 8**: Metas financeiras (CRUD real).
- **Etapa 9**: Transações recorrentes + parcelamentos.
- **Etapa 10**: Relatórios + exportação.
- **Etapa 11**: Busca global + filtros avançados (a busca atual em
  `/transacoes` é básica — só por descrição).
- **Etapa 12**: Notificações + calendário financeiro.
- **Etapa 13**: Perfil/configurações + onboarding inicial.
- **Etapa 14**: IA.

### Como testar

1. `.env.local` já configurado (ver STATUS_2.md).
2. `npm install && npm run dev`
3. Logado, clique em "+ Nova transação" (topbar, bottom nav no mobile,
   ou dentro de `/transacoes`) — todos abrem o mesmo modal.
4. Crie uma despesa sem conta/categoria (ambas opcionais) — deve salvar
   e aparecer no dashboard e em `/transacoes`.
5. Em `/transacoes`, teste os filtros de tipo e a busca por descrição.
6. Teste excluir uma transação (passe o mouse/toque na linha).
7. Teste "Transferência" — deve exigir conta de origem e destino
   diferentes (se você ainda não tem contas cadastradas, vai aparecer
   "Nenhuma conta cadastrada ainda" no lugar do seletor — normal antes
   da Etapa 4).
