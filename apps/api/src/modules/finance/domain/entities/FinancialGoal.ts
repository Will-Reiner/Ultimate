import {
  InvalidFinancialGoalNameError,
  InvalidFinancialGoalAmountError,
  InvalidFinancialGoalStatusTransitionError,
} from '../errors/FinanceErrors';

export type FinancialGoalStatus = 'in_progress' | 'completed' | 'failed';

export interface CreateFinancialGoalProps {
  userId: string;
  name: string;
  targetAmount: number;
  deadline?: string | null;
  accountIds?: string[];
}

export interface RestoreFinancialGoalProps {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  accountIds: string[];
  status: FinancialGoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class FinancialGoal {
  private _name: string;
  private _targetAmount: number;
  private _currentAmount: number;
  private _deadline: string | null;
  private _accountIds: string[];
  private _status: FinancialGoalStatus;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    targetAmount: number,
    currentAmount: number,
    deadline: string | null,
    accountIds: string[],
    status: FinancialGoalStatus,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._targetAmount = targetAmount;
    this._currentAmount = currentAmount;
    this._deadline = deadline;
    this._accountIds = accountIds;
    this._status = status;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateFinancialGoalProps): FinancialGoal {
    const name = FinancialGoal.validateName(props.name);
    FinancialGoal.validateAmount(props.targetAmount);

    const now = new Date();
    return new FinancialGoal(
      '',
      props.userId,
      name,
      props.targetAmount,
      0,
      props.deadline ?? null,
      props.accountIds ?? [],
      'in_progress',
      now,
      now,
    );
  }

  static restore(props: RestoreFinancialGoalProps): FinancialGoal {
    return new FinancialGoal(
      props.id,
      props.userId,
      props.name,
      props.targetAmount,
      props.currentAmount,
      props.deadline,
      props.accountIds,
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this._name = FinancialGoal.validateName(name);
    this._updatedAt = new Date();
  }

  updateTargetAmount(amount: number): void {
    FinancialGoal.validateAmount(amount);
    this._targetAmount = amount;
    this._updatedAt = new Date();
  }

  updateDeadline(deadline: string | null): void {
    this._deadline = deadline;
    this._updatedAt = new Date();
  }

  addAccount(accountId: string): void {
    if (!this._accountIds.includes(accountId)) {
      this._accountIds.push(accountId);
    }
    this._updatedAt = new Date();
  }

  removeAccount(accountId: string): void {
    this._accountIds = this._accountIds.filter((id) => id !== accountId);
    this._updatedAt = new Date();
  }

  updateCurrentAmount(amount: number): void {
    this._currentAmount = amount;
    if (this._currentAmount >= this._targetAmount) {
      this._status = 'completed';
    }
    this._updatedAt = new Date();
  }

  calculateProgress(): number {
    const progress = (this._currentAmount / this._targetAmount) * 100;
    return Math.min(progress, 100);
  }

  complete(): void {
    if (this._status !== 'in_progress') {
      throw new InvalidFinancialGoalStatusTransitionError(this._status, 'completed');
    }
    this._status = 'completed';
    this._updatedAt = new Date();
  }

  markFailed(): void {
    if (this._status !== 'in_progress') {
      throw new InvalidFinancialGoalStatusTransitionError(this._status, 'failed');
    }
    this._status = 'failed';
    this._updatedAt = new Date();
  }

  checkDeadline(): void {
    if (this._deadline === null) return;
    if (this._status !== 'in_progress') return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (this._deadline < todayStr) {
      this._status = 'failed';
      this._updatedAt = new Date();
    }
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get targetAmount(): number { return this._targetAmount; }
  get currentAmount(): number { return this._currentAmount; }
  get deadline(): string | null { return this._deadline; }
  get accountIds(): string[] { return [...this._accountIds]; }
  get status(): FinancialGoalStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidFinancialGoalNameError('nome nao pode ser vazio.');
    }
    if (trimmed.length > 200) {
      throw new InvalidFinancialGoalNameError('nome nao pode ter mais de 200 caracteres.');
    }
    return trimmed;
  }

  private static validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new InvalidFinancialGoalAmountError('valor deve ser maior que zero.');
    }
  }
}
