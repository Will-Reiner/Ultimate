import {
  InvalidAccountNameError,
  InvalidAccountTypeError,
  AccountArchivedError,
} from '../errors/FinanceErrors';

export type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'other';

const VALID_TYPES: AccountType[] = ['checking', 'savings', 'cash', 'investment', 'other'];

export interface CreateAccountProps {
  userId: string;
  name: string;
  type: AccountType;
  color?: string | null;
  icon?: string | null;
}

export interface RestoreAccountProps {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string | null;
  icon: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Account {
  private _name: string;
  private _balance: number;
  private _color: string | null;
  private _icon: string | null;
  private _isArchived: boolean;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    private readonly _type: AccountType,
    balance: number,
    color: string | null,
    icon: string | null,
    isArchived: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._balance = balance;
    this._color = color;
    this._icon = icon;
    this._isArchived = isArchived;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateAccountProps): Account {
    const name = Account.validateName(props.name);
    Account.validateType(props.type);

    const now = new Date();
    return new Account(
      '',
      props.userId,
      name,
      props.type,
      0,
      props.color ?? null,
      props.icon ?? null,
      false,
      now,
      now,
    );
  }

  static restore(props: RestoreAccountProps): Account {
    return new Account(
      props.id,
      props.userId,
      props.name,
      props.type,
      props.balance,
      props.color,
      props.icon,
      props.isArchived,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this.ensureActive();
    this._name = Account.validateName(name);
    this._updatedAt = new Date();
  }

  updateColor(color: string | null): void {
    this.ensureActive();
    this._color = color;
    this._updatedAt = new Date();
  }

  updateIcon(icon: string | null): void {
    this.ensureActive();
    this._icon = icon;
    this._updatedAt = new Date();
  }

  credit(amount: number): void {
    this.ensureActive();
    if (amount <= 0) {
      throw new Error('Valor do credito deve ser maior que zero.');
    }
    this._balance += amount;
    this._updatedAt = new Date();
  }

  debit(amount: number): void {
    this.ensureActive();
    if (amount <= 0) {
      throw new Error('Valor do debito deve ser maior que zero.');
    }
    this._balance -= amount;
    this._updatedAt = new Date();
  }

  adjustBalance(newBalance: number): void {
    this.ensureActive();
    this._balance = newBalance;
    this._updatedAt = new Date();
  }

  archive(): void {
    this._isArchived = true;
    this._updatedAt = new Date();
  }

  reactivate(): void {
    this._isArchived = false;
    this._updatedAt = new Date();
  }

  ensureActive(): void {
    if (this._isArchived) {
      throw new AccountArchivedError();
    }
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get type(): AccountType { return this._type; }
  get balance(): number { return this._balance; }
  get color(): string | null { return this._color; }
  get icon(): string | null { return this._icon; }
  get isArchived(): boolean { return this._isArchived; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidAccountNameError('nome nao pode ser vazio.');
    }
    if (trimmed.length > 100) {
      throw new InvalidAccountNameError('nome nao pode ter mais de 100 caracteres.');
    }
    return trimmed;
  }

  private static validateType(type: string): void {
    if (!VALID_TYPES.includes(type as AccountType)) {
      throw new InvalidAccountTypeError(type);
    }
  }
}
