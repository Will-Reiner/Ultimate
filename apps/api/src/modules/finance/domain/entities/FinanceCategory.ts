import {
  InvalidFinanceCategoryNameError,
  InvalidFinanceCategoryTypeError,
  PredefinedCategoryImmutableError,
} from '../errors/FinanceErrors';

export type FinanceCategoryType = 'income' | 'expense';

export interface CreateFinanceCategoryProps {
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: FinanceCategoryType;
}

export interface RestoreFinanceCategoryProps {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: FinanceCategoryType;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VALID_TYPES: FinanceCategoryType[] = ['income', 'expense'];

interface PredefinedDef {
  name: string;
  icon: string;
  color: string;
}

const PREDEFINED_EXPENSE: PredefinedDef[] = [
  { name: 'Alimentação', icon: 'utensils', color: '#FF6B6B' },
  { name: 'Transporte', icon: 'car', color: '#4ECDC4' },
  { name: 'Moradia', icon: 'home', color: '#45B7D1' },
  { name: 'Saúde', icon: 'heart-pulse', color: '#96CEB4' },
  { name: 'Educação', icon: 'graduation-cap', color: '#FFEAA7' },
  { name: 'Lazer', icon: 'gamepad', color: '#DDA0DD' },
  { name: 'Vestuário', icon: 'shirt', color: '#98D8C8' },
  { name: 'Assinaturas', icon: 'credit-card', color: '#F7DC6F' },
  { name: 'Outros', icon: 'ellipsis', color: '#BDC3C7' },
];

const PREDEFINED_INCOME: PredefinedDef[] = [
  { name: 'Salário', icon: 'wallet', color: '#2ECC71' },
  { name: 'Freelance', icon: 'laptop', color: '#3498DB' },
  { name: 'Investimentos', icon: 'trending-up', color: '#9B59B6' },
  { name: 'Outros', icon: 'ellipsis', color: '#BDC3C7' },
];

export class FinanceCategory {
  private _name: string;
  private _icon: string;
  private _color: string;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    icon: string,
    color: string,
    private readonly _type: FinanceCategoryType,
    private readonly _isPredefined: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._icon = icon;
    this._color = color;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateFinanceCategoryProps): FinanceCategory {
    const name = FinanceCategory.validateName(props.name);
    FinanceCategory.validateType(props.type);

    const now = new Date();
    return new FinanceCategory(
      '',
      props.userId,
      name,
      props.icon,
      props.color,
      props.type,
      false,
      now,
      now,
    );
  }

  static restore(props: RestoreFinanceCategoryProps): FinanceCategory {
    return new FinanceCategory(
      props.id,
      props.userId,
      props.name,
      props.icon,
      props.color,
      props.type,
      props.isPredefined,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Predefined Categories ────────────────────────────────────────────

  static getPredefinedExpense(): FinanceCategory[] {
    const now = new Date();
    return PREDEFINED_EXPENSE.map((def) =>
      FinanceCategory.restore({
        id: '',
        userId: '',
        name: def.name,
        icon: def.icon,
        color: def.color,
        type: 'expense',
        isPredefined: true,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static getPredefinedIncome(): FinanceCategory[] {
    const now = new Date();
    return PREDEFINED_INCOME.map((def) =>
      FinanceCategory.restore({
        id: '',
        userId: '',
        name: def.name,
        icon: def.icon,
        color: def.color,
        type: 'income',
        isPredefined: true,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this.guardPredefined();
    this._name = FinanceCategory.validateName(name);
    this._updatedAt = new Date();
  }

  updateIcon(icon: string): void {
    this.guardPredefined();
    this._icon = icon;
    this._updatedAt = new Date();
  }

  updateColor(color: string): void {
    this.guardPredefined();
    this._color = color;
    this._updatedAt = new Date();
  }

  ensureNotPredefined(): void {
    this.guardPredefined();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get icon(): string { return this._icon; }
  get color(): string { return this._color; }
  get type(): FinanceCategoryType { return this._type; }
  get isPredefined(): boolean { return this._isPredefined; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private guardPredefined(): void {
    if (this._isPredefined) {
      throw new PredefinedCategoryImmutableError();
    }
  }

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidFinanceCategoryNameError('nome nao pode ser vazio.');
    }
    if (trimmed.length > 100) {
      throw new InvalidFinanceCategoryNameError('nome nao pode ter mais de 100 caracteres.');
    }
    return trimmed;
  }

  private static validateType(type: string): void {
    if (!VALID_TYPES.includes(type as FinanceCategoryType)) {
      throw new InvalidFinanceCategoryTypeError(type);
    }
  }
}
