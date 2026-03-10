import { CategoryLimit } from '../value-objects/CategoryLimit';
import {
  InvalidBudgetLimitError,
  InvalidBudgetMonthError,
} from '../errors/FinanceErrors';

export interface CreateBudgetProps {
  userId: string;
  month: string;
  generalLimit?: number | null;
  categoryLimits?: CategoryLimit[];
}

export interface RestoreBudgetProps {
  id: string;
  userId: string;
  month: string;
  generalLimit: number | null;
  categoryLimits: CategoryLimit[];
  createdAt: Date;
  updatedAt: Date;
}

const MONTH_REGEX = /^\d{4}-\d{2}$/;

export class Budget {
  private _generalLimit: number | null;
  private _categoryLimits: CategoryLimit[];
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _month: string,
    generalLimit: number | null,
    categoryLimits: CategoryLimit[],
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._generalLimit = generalLimit;
    this._categoryLimits = categoryLimits;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateBudgetProps): Budget {
    Budget.validateMonth(props.month);

    const generalLimit = props.generalLimit ?? null;
    if (generalLimit !== null) {
      Budget.validateLimit(generalLimit);
    }

    const now = new Date();
    return new Budget(
      '',
      props.userId,
      props.month,
      generalLimit,
      props.categoryLimits ?? [],
      now,
      now,
    );
  }

  static restore(props: RestoreBudgetProps): Budget {
    return new Budget(
      props.id,
      props.userId,
      props.month,
      props.generalLimit,
      props.categoryLimits,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateGeneralLimit(limit: number | null): void {
    if (limit !== null) {
      Budget.validateLimit(limit);
    }
    this._generalLimit = limit;
    this._updatedAt = new Date();
  }

  addCategoryLimit(categoryLimit: CategoryLimit): void {
    const idx = this._categoryLimits.findIndex(
      (cl) => cl.categoryId === categoryLimit.categoryId,
    );
    if (idx >= 0) {
      this._categoryLimits[idx] = categoryLimit;
    } else {
      this._categoryLimits.push(categoryLimit);
    }
    this._updatedAt = new Date();
  }

  removeCategoryLimit(categoryId: string): void {
    this._categoryLimits = this._categoryLimits.filter(
      (cl) => cl.categoryId !== categoryId,
    );
    this._updatedAt = new Date();
  }

  getCategoryLimit(categoryId: string): CategoryLimit | undefined {
    return this._categoryLimits.find((cl) => cl.categoryId === categoryId);
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get month(): string { return this._month; }
  get generalLimit(): number | null { return this._generalLimit; }
  get categoryLimits(): CategoryLimit[] { return [...this._categoryLimits]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateMonth(month: string): void {
    if (!MONTH_REGEX.test(month)) {
      throw new InvalidBudgetMonthError(month);
    }
  }

  private static validateLimit(limit: number): void {
    if (limit <= 0) {
      throw new InvalidBudgetLimitError('limite deve ser maior que zero.');
    }
  }
}
