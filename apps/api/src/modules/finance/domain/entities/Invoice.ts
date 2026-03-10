import {
  InvalidInvoiceStatusTransitionError,
  InvalidInvoicePaymentError,
} from '../errors/FinanceErrors';

export type InvoiceStatus = 'open' | 'closed' | 'paid';

export interface CreateInvoiceProps {
  creditCardId: string;
  userId: string;
  month: string;
  closingDate: string;
  dueDate: string;
}

export interface RestoreInvoiceProps {
  id: string;
  creditCardId: string;
  userId: string;
  month: string;
  closingDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAmount: number;
  paidWithAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Invoice {
  private _status: InvoiceStatus;
  private _totalAmount: number;
  private _paidAmount: number;
  private _paidWithAccountId: string | null;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _creditCardId: string,
    private readonly _userId: string,
    private readonly _month: string,
    private readonly _closingDate: string,
    private readonly _dueDate: string,
    status: InvoiceStatus,
    totalAmount: number,
    paidAmount: number,
    paidWithAccountId: string | null,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._status = status;
    this._totalAmount = totalAmount;
    this._paidAmount = paidAmount;
    this._paidWithAccountId = paidWithAccountId;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateInvoiceProps): Invoice {
    const now = new Date();
    return new Invoice(
      '',
      props.creditCardId,
      props.userId,
      props.month,
      props.closingDate,
      props.dueDate,
      'open',
      0,
      0,
      null,
      now,
      now,
    );
  }

  static restore(props: RestoreInvoiceProps): Invoice {
    return new Invoice(
      props.id,
      props.creditCardId,
      props.userId,
      props.month,
      props.closingDate,
      props.dueDate,
      props.status,
      props.totalAmount,
      props.paidAmount,
      props.paidWithAccountId,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTotalAmount(amount: number): void {
    this._totalAmount = amount;
    this._updatedAt = new Date();
  }

  close(): void {
    if (this._status !== 'open') {
      throw new InvalidInvoiceStatusTransitionError(this._status, 'closed');
    }
    this._status = 'closed';
    this._updatedAt = new Date();
  }

  registerPayment(amount: number, accountId: string): void {
    if (this._status !== 'closed') {
      throw new InvalidInvoicePaymentError(
        'fatura deve estar fechada para receber pagamento',
      );
    }
    if (amount <= 0) {
      throw new InvalidInvoicePaymentError('valor deve ser maior que zero');
    }

    this._paidAmount += amount;
    this._paidWithAccountId = accountId;

    if (this._paidAmount >= this._totalAmount) {
      this._status = 'paid';
    }

    this._updatedAt = new Date();
  }

  reopen(): void {
    if (this._status !== 'closed') {
      throw new InvalidInvoiceStatusTransitionError(this._status, 'open');
    }
    this._status = 'open';
    this._paidAmount = 0;
    this._paidWithAccountId = null;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get creditCardId(): string { return this._creditCardId; }
  get userId(): string { return this._userId; }
  get month(): string { return this._month; }
  get closingDate(): string { return this._closingDate; }
  get dueDate(): string { return this._dueDate; }
  get status(): InvoiceStatus { return this._status; }
  get totalAmount(): number { return this._totalAmount; }
  get paidAmount(): number { return this._paidAmount; }
  get paidWithAccountId(): string | null { return this._paidWithAccountId; }
  get remainingAmount(): number { return this._totalAmount - this._paidAmount; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
