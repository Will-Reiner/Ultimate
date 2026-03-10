import {
  InvalidCreditCardNameError,
  InvalidCreditCardLimitError,
  InvalidClosingDayError,
  InvalidDueDayError,
  CreditCardArchivedError,
} from '../errors/FinanceErrors';

export interface CreateCreditCardProps {
  userId: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color?: string | null;
  icon?: string | null;
}

export interface RestoreCreditCardProps {
  id: string;
  userId: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string | null;
  icon: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreditCard {
  private _name: string;
  private _limit: number;
  private _closingDay: number;
  private _dueDay: number;
  private _color: string | null;
  private _icon: string | null;
  private _isArchived: boolean;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    limit: number,
    closingDay: number,
    dueDay: number,
    color: string | null,
    icon: string | null,
    isArchived: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._limit = limit;
    this._closingDay = closingDay;
    this._dueDay = dueDay;
    this._color = color;
    this._icon = icon;
    this._isArchived = isArchived;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateCreditCardProps): CreditCard {
    const name = CreditCard.validateName(props.name);
    CreditCard.validateLimit(props.limit);
    CreditCard.validateClosingDay(props.closingDay);
    CreditCard.validateDueDay(props.dueDay);

    const now = new Date();
    return new CreditCard(
      '',
      props.userId,
      name,
      props.limit,
      props.closingDay,
      props.dueDay,
      props.color ?? null,
      props.icon ?? null,
      false,
      now,
      now,
    );
  }

  static restore(props: RestoreCreditCardProps): CreditCard {
    return new CreditCard(
      props.id,
      props.userId,
      props.name,
      props.limit,
      props.closingDay,
      props.dueDay,
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
    this._name = CreditCard.validateName(name);
    this._updatedAt = new Date();
  }

  updateLimit(limit: number): void {
    this.ensureActive();
    CreditCard.validateLimit(limit);
    this._limit = limit;
    this._updatedAt = new Date();
  }

  updateClosingDay(closingDay: number): void {
    this.ensureActive();
    CreditCard.validateClosingDay(closingDay);
    this._closingDay = closingDay;
    this._updatedAt = new Date();
  }

  updateDueDay(dueDay: number): void {
    this.ensureActive();
    CreditCard.validateDueDay(dueDay);
    this._dueDay = dueDay;
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

  calculateAvailableLimit(openInvoiceTotal: number): number {
    return this._limit - openInvoiceTotal;
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
      throw new CreditCardArchivedError();
    }
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get limit(): number { return this._limit; }
  get closingDay(): number { return this._closingDay; }
  get dueDay(): number { return this._dueDay; }
  get color(): string | null { return this._color; }
  get icon(): string | null { return this._icon; }
  get isArchived(): boolean { return this._isArchived; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidCreditCardNameError('nome nao pode ser vazio.');
    }
    if (trimmed.length > 100) {
      throw new InvalidCreditCardNameError('nome nao pode ter mais de 100 caracteres.');
    }
    return trimmed;
  }

  private static validateLimit(limit: number): void {
    if (limit <= 0) {
      throw new InvalidCreditCardLimitError('limite deve ser maior que zero.');
    }
  }

  private static validateClosingDay(day: number): void {
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new InvalidClosingDayError();
    }
  }

  private static validateDueDay(day: number): void {
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new InvalidDueDayError();
    }
  }
}
