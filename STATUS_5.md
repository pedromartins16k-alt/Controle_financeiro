# STATUS_5 — Controle Financeiro Pessoal

## Etapa concluída: 5 — Cartões de Crédito e Faturas

### O que foi criado

- **Página /cartoes** (src/app/cartoes/page.tsx):
  - Carregamento de todos os cartões cadastrados do usuário.
  - Cálculo em tempo real de fatura atual, limite disponível e dias até o vencimento.
- **Design Visual do Cartão** (src/components/cartao/cartao-visual.tsx):
  - Representação gráfica de cartão de crédito no padrão SaaS premium com chip EMV, logotipo do banco, máscara de 4 dígitos, gradiente de cores e barra de consumo de limite.
- **Grid e Ações de Cartões** (src/components/cartao/cartoes-grid.tsx):
  - Banner dinâmico com alertas de faturas próximas do vencimento (<= 3 dias).
  - Modal de pagamento de fatura com opção de debitar o valor de uma conta corrente/carteira.
  - Ações de editar e excluir cartões.
- **Modal de Cartão** (src/components/cartao/cartao-modal.tsx):
  - Formulário para cadastrar/editar cartão com nome, banco, limite total, dia de fechamento, dia de vencimento, últimos 4 dígitos e cor.
- **Server Actions** (src/lib/supabase/card-actions.ts):
  - createCreditCard, updateCreditCard, deleteCreditCard, payCreditCardInvoice.
- **Integração no Modal de Transações** (src/components/transactions/transaction-modal.tsx):
  - Ao selecionar a forma de pagamento "Crédito", o modal exibe o seletor dos cartões do usuário para vincular automaticamente as despesas à fatura do cartão.
- **Tipagem**: Interfaces CreditCardRow e InvoiceRow adicionadas em src/lib/types.ts.
