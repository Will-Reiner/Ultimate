// ── Account ──────────────────────────────────────────────

export class AccountNotFoundError extends Error {
  constructor() {
    super('Conta nao encontrada.');
    this.name = 'AccountNotFoundError';
  }
}

export class InvalidAccountNameError extends Error {
  constructor(reason: string) {
    super(`Nome da conta invalido: ${reason}`);
    this.name = 'InvalidAccountNameError';
  }
}

export class InvalidAccountTypeError extends Error {
  constructor(type: string) {
    super(`Tipo de conta invalido: ${type}`);
    this.name = 'InvalidAccountTypeError';
  }
}

export class AccountArchivedError extends Error {
  constructor() {
    super('Conta esta arquivada.');
    this.name = 'AccountArchivedError';
  }
}

// ── CreditCard ───────────────────────────────────────────

export class CreditCardNotFoundError extends Error {
  constructor() {
    super('Cartao de credito nao encontrado.');
    this.name = 'CreditCardNotFoundError';
  }
}

export class InvalidCreditCardNameError extends Error {
  constructor(reason: string) {
    super(`Nome do cartao invalido: ${reason}`);
    this.name = 'InvalidCreditCardNameError';
  }
}

export class InvalidCreditCardLimitError extends Error {
  constructor(reason: string) {
    super(`Limite do cartao invalido: ${reason}`);
    this.name = 'InvalidCreditCardLimitError';
  }
}

export class InvalidClosingDayError extends Error {
  constructor() {
    super('Dia de fechamento invalido. Deve ser entre 1 e 31.');
    this.name = 'InvalidClosingDayError';
  }
}

export class InvalidDueDayError extends Error {
  constructor() {
    super('Dia de vencimento invalido. Deve ser entre 1 e 31.');
    this.name = 'InvalidDueDayError';
  }
}

export class CreditCardArchivedError extends Error {
  constructor() {
    super('Cartao de credito esta arquivado.');
    this.name = 'CreditCardArchivedError';
  }
}

// ── Transaction ──────────────────────────────────────────

export class TransactionNotFoundError extends Error {
  constructor() {
    super('Transacao nao encontrada.');
    this.name = 'TransactionNotFoundError';
  }
}

export class InvalidTransactionAmountError extends Error {
  constructor() {
    super('Valor da transacao deve ser maior que zero.');
    this.name = 'InvalidTransactionAmountError';
  }
}

export class InvalidTransactionDescriptionError extends Error {
  constructor(reason: string) {
    super(`Descricao da transacao invalida: ${reason}`);
    this.name = 'InvalidTransactionDescriptionError';
  }
}

export class InvalidTransactionSourceError extends Error {
  constructor(reason: string) {
    super(`Origem da transacao invalida: ${reason}`);
    this.name = 'InvalidTransactionSourceError';
  }
}

export class InvalidTransactionTypeError extends Error {
  constructor(reason: string) {
    super(`Tipo de transacao invalido: ${reason}`);
    this.name = 'InvalidTransactionTypeError';
  }
}

// ── Installment ──────────────────────────────────────────

export class InvalidInstallmentError extends Error {
  constructor(reason: string) {
    super(`Parcelamento invalido: ${reason}`);
    this.name = 'InvalidInstallmentError';
  }
}

// ── TransactionRecurrence ────────────────────────────────

export class InvalidTransactionRecurrenceError extends Error {
  constructor(reason: string) {
    super(`Recorrencia invalida: ${reason}`);
    this.name = 'InvalidTransactionRecurrenceError';
  }
}

// ── Invoice ──────────────────────────────────────────────

export class InvoiceNotFoundError extends Error {
  constructor() {
    super('Fatura nao encontrada.');
    this.name = 'InvoiceNotFoundError';
  }
}

export class InvalidInvoiceStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transicao de status da fatura invalida: ${from} -> ${to}`);
    this.name = 'InvalidInvoiceStatusTransitionError';
  }
}

export class InvalidInvoicePaymentError extends Error {
  constructor(reason: string) {
    super(`Pagamento da fatura invalido: ${reason}`);
    this.name = 'InvalidInvoicePaymentError';
  }
}

// ── Budget ───────────────────────────────────────────────

export class BudgetNotFoundError extends Error {
  constructor() {
    super('Orcamento nao encontrado.');
    this.name = 'BudgetNotFoundError';
  }
}

export class InvalidBudgetLimitError extends Error {
  constructor(reason: string) {
    super(`Limite do orcamento invalido: ${reason}`);
    this.name = 'InvalidBudgetLimitError';
  }
}

export class InvalidCategoryLimitError extends Error {
  constructor(reason: string) {
    super(`Limite por categoria invalido: ${reason}`);
    this.name = 'InvalidCategoryLimitError';
  }
}

// ── FinancialGoal ────────────────────────────────────────

export class FinancialGoalNotFoundError extends Error {
  constructor() {
    super('Meta financeira nao encontrada.');
    this.name = 'FinancialGoalNotFoundError';
  }
}

export class InvalidFinancialGoalNameError extends Error {
  constructor(reason: string) {
    super(`Nome da meta financeira invalido: ${reason}`);
    this.name = 'InvalidFinancialGoalNameError';
  }
}

export class InvalidFinancialGoalAmountError extends Error {
  constructor(reason: string) {
    super(`Valor da meta financeira invalido: ${reason}`);
    this.name = 'InvalidFinancialGoalAmountError';
  }
}

export class InvalidFinancialGoalStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transicao de status da meta invalida: ${from} -> ${to}`);
    this.name = 'InvalidFinancialGoalStatusTransitionError';
  }
}

// ── FinanceTag ───────────────────────────────────────────

export class InvalidFinanceTagNameError extends Error {
  constructor(reason: string) {
    super(`Nome da tag invalido: ${reason}`);
    this.name = 'InvalidFinanceTagNameError';
  }
}

// ── FinanceCategory ──────────────────────────────────────

export class InvalidFinanceCategoryNameError extends Error {
  constructor(reason: string) {
    super(`Nome da categoria invalido: ${reason}`);
    this.name = 'InvalidFinanceCategoryNameError';
  }
}

export class InvalidFinanceCategoryTypeError extends Error {
  constructor(type: string) {
    super(`Tipo de categoria invalido: ${type}`);
    this.name = 'InvalidFinanceCategoryTypeError';
  }
}

export class PredefinedCategoryImmutableError extends Error {
  constructor() {
    super('Categorias predefinidas nao podem ser alteradas.');
    this.name = 'PredefinedCategoryImmutableError';
  }
}
