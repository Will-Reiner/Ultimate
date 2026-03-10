# Finanças Pessoais — Mapeamento Completo

## Entidades

### Account (Conta bancária / Carteira)
    id
    userId
    name (obrigatório, max 100 chars — ex: "Nubank", "Carteira")
    type: "checking" | "savings" | "cash" | "investment" | "other"
    balance: number (saldo atual)
    color: string | null
    icon: string | null
    isArchived: boolean (default false)
    createdAt
    updatedAt

### CreditCard (Cartão de crédito)
    id
    userId
    name (obrigatório, max 100 chars — ex: "Nubank Visa")
    limit: number (limite total)
    closingDay: number (dia de fechamento da fatura — 1 a 31)
    dueDay: number (dia de vencimento — 1 a 31)
    color: string | null
    icon: string | null
    isArchived: boolean (default false)
    createdAt
    updatedAt

### Transaction (Transação — receita, despesa ou compra no cartão)
    id
    userId
    type: "income" | "expense"
    amount: number (valor positivo sempre)
    description: string (obrigatório)
    date: string (YYYY-MM-DD)
    categoryId: string
    accountId: string | null (conta de origem — null se for no cartão)
    creditCardId: string | null (cartão — null se for na conta)
    tags: FinanceTag[]
    isInstallment: boolean (default false)
    installment: Installment | null (value object — só quando parcelado)
    recurrence: TransactionRecurrence | null (value object — só quando recorrente)
    note: string | null
    createdAt
    updatedAt

### Budget (Orçamento)
    id
    userId
    month: string (YYYY-MM)
    generalLimit: number | null (limite geral do mês)
    categoryLimits: CategoryLimit[]
    createdAt
    updatedAt

### Invoice (Fatura do cartão — gerada automaticamente por mês)
    id
    creditCardId
    userId
    month: string (YYYY-MM)
    closingDate: string (YYYY-MM-DD — calculado a partir do closingDay)
    dueDate: string (YYYY-MM-DD — calculado a partir do dueDay)
    status: "open" | "closed" | "paid"
    totalAmount: number (soma das transações + parcelas do período)
    paidAmount: number (quanto já pagou)
    paidFromAccountId: string | null (de qual conta pagou)
    createdAt
    updatedAt

### FinancialGoal
    id
    userId
    name (obrigatório — ex: "Juntar R$50k pra entrada do apê")
    targetAmount: number
    currentAmount: number (calculado automaticamente a partir do saldo das contas vinculadas, ou atualizado manualmente)
    accountIds: string[] (contas vinculadas à meta — ex: conta poupança específica)
    deadline: Date | null
    status: "in_progress" | "completed" | "failed"
    createdAt
    updatedAt

## Value Objects

### Installment (Parcelamento)
    totalInstallments: number (ex: 10)
    currentInstallment: number (ex: 3 de 10)
    installmentAmount: number (valor de cada parcela)
    parentTransactionId: string (referência à transação original/primeira)

### TransactionRecurrence
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    endDate: Date | null (null = indefinida)
    nextOccurrence: string (YYYY-MM-DD)

### FinanceCategory (pré-definida + customizável)
    id
    name: string
    icon: string
    color: string
    type: "income" | "expense" (categoria é pra receita ou despesa)
    isPredefined: boolean
    userId: string | null (null se pré-definida)

### CategoryLimit (limite por categoria dentro do orçamento)
    categoryId: string
    limit: number

### FinanceTag
    id
    userId
    name: string
    color: string | null
    
### Categorias pré-definidas
    Despesas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Assinaturas, Outros 
    Receitas: Salário, Freelance, Investimentos, Outros

## Regras de Negócio (formato TDD)

describe('Account')

  describe('criação')
    it('deve criar conta com nome e tipo obrigatórios')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome com mais de 100 caracteres')
    it('deve aceitar tipos: checking, savings, cash, investment, other')
    it('deve iniciar com balance = 0')
    it('deve iniciar com isArchived = false')

  describe('saldo')
    it('deve aumentar saldo ao registrar receita na conta')
    it('deve diminuir saldo ao registrar despesa na conta')
    it('deve recalcular saldo ao excluir transação')
    it('deve recalcular saldo ao editar valor de transação')
    it('deve diminuir saldo ao pagar fatura de cartão a partir desta conta')

  describe('edição')
    it('deve atualizar nome')
    it('deve atualizar cor e ícone')
    it('deve permitir ajuste manual de saldo')

  describe('ciclo de vida')
    it('deve arquivar conta')
    it('deve reativar conta arquivada')
    it('deve manter histórico ao arquivar')
    it('não deve permitir novas transações em conta arquivada')

describe('CreditCard')

  describe('criação')
    it('deve criar cartão com nome, limite, dia de fechamento e dia de vencimento')
    it('deve rejeitar nome vazio')
    it('deve rejeitar limite <= 0')
    it('deve rejeitar closingDay fora de 1-31')
    it('deve rejeitar dueDay fora de 1-31')
    it('deve iniciar com isArchived = false')

  describe('limite')
    it('deve calcular limite disponível (limite - total da fatura aberta)')
    it('deve atualizar limite')

  describe('edição')
    it('deve atualizar nome')
    it('deve atualizar limite')
    it('deve atualizar dias de fechamento e vencimento')
    it('deve atualizar cor e ícone')

  describe('ciclo de vida')
    it('deve arquivar cartão')
    it('deve reativar cartão arquivado')
    it('não deve permitir novas transações em cartão arquivado')

describe('Transaction')

  describe('criação - básica')
    it('deve criar transação de receita com campos obrigatórios')
    it('deve criar transação de despesa com campos obrigatórios')
    it('deve rejeitar amount <= 0')
    it('deve rejeitar descrição vazia')
    it('deve exigir accountId ou creditCardId (um dos dois)')
    it('deve rejeitar transação com accountId e creditCardId simultaneamente')
    it('deve rejeitar receita em cartão de crédito')
    it('deve permitir criar com tags')
    it('deve permitir criar com nota')
    it('deve permitir criar sem tags e sem nota')

  describe('criação - parcelamento')
    it('deve criar transação parcelada com total de parcelas e valor por parcela')
    it('deve rejeitar totalInstallments <= 0')
    it('deve rejeitar installmentAmount <= 0')
    it('deve iniciar currentInstallment = 1')
    it('deve gerar parcelas futuras automaticamente (mesma data, mês seguinte)')
    it('cada parcela deve referenciar a transação original via parentTransactionId')
    it('parcelas devem cair na fatura do mês correspondente')
    it('parcelamento só é permitido em cartão de crédito')

  describe('criação - recorrente')
    it('deve criar transação recorrente com frequência')
    it('deve calcular nextOccurrence baseado na frequência')
    it('deve gerar próxima transação automaticamente na data')
    it('deve parar de gerar quando endDate é atingida')
    it('deve gerar indefinidamente quando endDate é null')
    it('recorrência é permitida em conta e cartão')

  describe('edição')
    it('deve atualizar descrição')
    it('deve atualizar valor')
    it('deve atualizar categoria')
    it('deve atualizar data')
    it('deve adicionar tag')
    it('deve remover tag')
    it('deve atualizar nota')

  describe('exclusão')
    it('deve permitir excluir transação')
    it('deve recalcular saldo da conta ao excluir')
    it('deve recalcular total da fatura ao excluir transação do cartão')
    it('ao excluir transação parcelada, deve perguntar: só esta parcela ou todas futuras')

describe('Invoice')

  describe('geração')
    it('deve gerar fatura automaticamente para cada mês com transações')
    it('deve calcular closingDate baseado no closingDay do cartão')
    it('deve calcular dueDate baseado no dueDay do cartão')
    it('deve iniciar com status "open"')
    it('deve somar transações + parcelas do período na fatura')
    it('deve incluir parcelas de compras parceladas no mês correto')

  describe('ciclo de vida')
    it('deve fechar fatura na data de fechamento (status "closed")')
    it('deve marcar como paga ao registrar pagamento (status "paid")')
    it('deve registrar de qual conta saiu o pagamento')
    it('deve diminuir saldo da conta ao pagar fatura')
    it('deve permitir pagamento parcial')
    it('deve calcular saldo restante (totalAmount - paidAmount)')

  describe('consulta')
    it('deve listar transações da fatura ordenadas por data')
    it('deve separar parcelas de compras parceladas')
    it('deve mostrar valor total e valor pago')

describe('Budget')

  describe('criação')
    it('deve criar orçamento para um mês específico')
    it('deve permitir limite geral do mês')
    it('deve permitir limite por categoria')
    it('deve permitir ambos (geral + por categoria)')
    it('deve rejeitar limite <= 0')
    it('deve rejeitar mês duplicado para o mesmo usuário')

  describe('acompanhamento')
    it('deve calcular total gasto no mês')
    it('deve calcular gasto por categoria no mês')
    it('deve calcular % utilizado do limite geral')
    it('deve calcular % utilizado por categoria')
    it('deve identificar categorias que ultrapassaram o limite')
    it('deve identificar quando limite geral foi ultrapassado')

  describe('edição')
    it('deve atualizar limite geral')
    it('deve adicionar limite por categoria')
    it('deve remover limite de categoria')
    it('deve atualizar limite de categoria existente')

describe('Installment')
    it('deve criar com totalInstallments, currentInstallment e installmentAmount')
    it('deve rejeitar totalInstallments <= 0')
    it('deve rejeitar currentInstallment > totalInstallments')
    it('deve rejeitar installmentAmount <= 0')
    it('deve calcular valor total (totalInstallments * installmentAmount)')

describe('TransactionRecurrence')
    it('deve criar com frequência obrigatória')
    it('deve aceitar frequências: daily, weekly, monthly, yearly')
    it('deve calcular nextOccurrence corretamente para cada frequência')
    it('deve permitir endDate null (indefinida)')
    it('deve rejeitar endDate no passado')

describe('FinanceCategory')

  describe('pré-definidas')
    it('deve existir categorias pré-definidas de despesa')
    it('deve existir categorias pré-definidas de receita')
    it('não deve permitir excluir categoria pré-definida')
    it('não deve permitir editar categoria pré-definida')

  describe('customizadas')
    it('deve criar categoria com nome, tipo, ícone e cor')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')
    it('deve exigir tipo (income ou expense)')
    it('deve permitir excluir categoria customizada')
    it('deve reatribuir transações ao excluir categoria (para "Outros")')

describe('FinanceTag')
    it('deve criar tag com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')
    it('tags de finanças devem ser independentes das tags de outros contextos')

describe('Balanço Mensal')

  describe('cálculo')
    it('deve calcular total de receitas no mês')
    it('deve calcular total de despesas no mês (contas + faturas pagas)')
    it('deve calcular saldo do mês (receitas - despesas)')
    it('deve calcular taxa de economia (saldo / receitas)')
    it('deve comparar com mês anterior (variação %)')
    it('deve calcular saldo total de todas as contas')

  describe('projeção')
    it('deve projetar despesas futuras do mês (recorrentes + parcelas pendentes)')
    it('deve projetar saldo final do mês baseado em recorrentes')

describe('FinancialGoal')

  describe('criação')
    it('deve criar meta com nome e valor alvo obrigatórios')
    it('deve rejeitar nome vazio')
    it('deve rejeitar targetAmount <= 0')
    it('deve iniciar com currentAmount = 0')
    it('deve iniciar com status "in_progress"')
    it('deve permitir criar com ou sem deadline')
    it('deve permitir criar com ou sem contas vinculadas')

  describe('progresso')
    it('deve calcular progresso como % (currentAmount / targetAmount)')
    it('deve atualizar currentAmount baseado no saldo das contas vinculadas')
    it('deve marcar como "completed" ao atingir targetAmount')
    it('deve marcar como "failed" ao passar do deadline sem atingir')
    it('deve nunca marcar como "failed" se não tem deadline')

  describe('edição')
    it('deve atualizar nome')
    it('deve atualizar targetAmount')
    it('deve atualizar deadline')
    it('deve vincular conta')
    it('deve desvincular conta')

  describe('exclusão')
    it('deve permitir excluir meta')
    it('deve não afetar contas vinculadas ao excluir')
