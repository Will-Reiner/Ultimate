import { Installment } from '../value-objects/Installment';
import { TransactionRecurrence } from '../value-objects/TransactionRecurrence';
import {
  InvalidTransactionAmountError,
  InvalidTransactionDescriptionError,
  InvalidTransactionTypeError,
  InvalidTransactionSourceError,
  InvalidInstallmentError,
} from '../errors/FinanceErrors';

export type TransactionType = 'income' | 'expense';

const VALID_TYPES: TransactionType[] = ['income', 'expense'];

export interface CreateTransactionProps {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  accountId?: string | null;
  creditCardId?: string | null;
  tags?: string[];
  installment?: Installment | null;
  recurrence?: TransactionRecurrence | null;
  note?: string | null;
}

export interface RestoreTransactionProps {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  accountId: string | null;
  creditCardId: string | null;
  tags: string[];
  installment: Installment | null;
  recurrence: TransactionRecurrence | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private _description: string;
  private _amount: number;
  private _categoryId: string;
  private _date: string;
  private _tags: string[];
  private _note: string | null;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _type: TransactionType,
    amount: number,
    description: string,
    date: string,
    categoryId: string,
    private readonly _accountId: string | null,
    private readonly _creditCardId: string | null,
    tags: string[],
    private readonly _installment: Installment | null,
    private readonly _recurrence: TransactionRecurrence | null,
    note: string | null,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._amount = amount;
    this._description = description;
    this._date = date;
    this._categoryId = categoryId;
    this._tags = tags;
    this._note = note;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateTransactionProps): Transaction {
    Transaction.validateAmount(props.amount);
    const description = Transaction.validateDescription(props.description);
    Transaction.validateType(props.type);

    const accountId = props.accountId ?? null;
    const creditCardId = props.creditCardId ?? null;
    Transaction.validateSource(props.type, accountId, creditCardId);

    const installment = props.installment ?? null;
    if (installment && !creditCardId) {
      throw new InvalidInstallmentError(
        'parcelamento so e permitido em cartao de credito',
      );
    }

    const now = new Date();
    return new Transaction(
      '',
      props.userId,
      props.type,
      props.amount,
      description,
      props.date,
      props.categoryId,
      accountId,
      creditCardId,
      props.tags ? [...props.tags] : [],
      installment,
      props.recurrence ?? null,
      props.note ?? null,
      now,
      now,
    );
  }

  static restore(props: RestoreTransactionProps): Transaction {
    return new Transaction(
      props.id,
      props.userId,
      props.type,
      props.amount,
      props.description,
      props.date,
      props.categoryId,
      props.accountId,
      props.creditCardId,
      [...props.tags],
      props.installment,
      props.recurrence,
      props.note,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateDescription(description: string): void {
    this._description = Transaction.validateDescription(description);
    this._updatedAt = new Date();
  }

  updateAmount(amount: number): void {
    Transaction.validateAmount(amount);
    this._amount = amount;
    this._updatedAt = new Date();
  }

  updateCategory(categoryId: string): void {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  updateDate(date: string): void {
    this._date = date;
    this._updatedAt = new Date();
  }

  addTag(tagId: string): void {
    if (!this._tags.includes(tagId)) {
      this._tags.push(tagId);
    }
    this._updatedAt = new Date();
  }

  removeTag(tagId: string): void {
    this._tags = this._tags.filter((t) => t !== tagId);
    this._updatedAt = new Date();
  }

  updateNote(note: string | null): void {
    this._note = note;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get type(): TransactionType { return this._type; }
  get amount(): number { return this._amount; }
  get description(): string { return this._description; }
  get date(): string { return this._date; }
  get categoryId(): string { return this._categoryId; }
  get accountId(): string | null { return this._accountId; }
  get creditCardId(): string | null { return this._creditCardId; }
  get tags(): string[] { return [...this._tags]; }
  get installment(): Installment | null { return this._installment; }
  get recurrence(): TransactionRecurrence | null { return this._recurrence; }
  get note(): string | null { return this._note; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new InvalidTransactionAmountError();
    }
  }

  private static validateDescription(description: string): string {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      throw new InvalidTransactionDescriptionError('descricao nao pode ser vazia.');
    }
    if (trimmed.length > 200) {
      throw new InvalidTransactionDescriptionError(
        'descricao nao pode ter mais de 200 caracteres.',
      );
    }
    return trimmed;
  }

  private static validateType(type: string): void {
    if (!VALID_TYPES.includes(type as TransactionType)) {
      throw new InvalidTransactionTypeError(type);
    }
  }

  private static validateSource(
    type: TransactionType,
    accountId: string | null,
    creditCardId: string | null,
  ): void {
    const hasAccount = !!accountId;
    const hasCreditCard = !!creditCardId;

    if (!hasAccount && !hasCreditCard) {
      throw new InvalidTransactionSourceError(
        'uma conta ou cartao de credito deve ser informado',
      );
    }

    if (hasAccount && hasCreditCard) {
      throw new InvalidTransactionSourceError(
        'apenas uma origem deve ser informada (conta ou cartao)',
      );
    }

    if (type === 'income' && hasCreditCard) {
      throw new InvalidTransactionSourceError(
        'receita nao pode ser em cartao de credito',
      );
    }
  }
}
