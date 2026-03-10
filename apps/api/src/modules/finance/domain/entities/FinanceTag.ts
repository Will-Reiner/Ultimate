import { InvalidFinanceTagNameError } from '../errors/FinanceErrors';

export interface CreateFinanceTagProps {
  userId: string;
  name: string;
  color?: string | null;
}

export interface RestoreFinanceTagProps {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FinanceTag {
  private _name: string;
  private _color: string | null;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    color: string | null,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._color = color;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateFinanceTagProps): FinanceTag {
    const name = FinanceTag.validateName(props.name);
    const now = new Date();

    return new FinanceTag(
      '',
      props.userId,
      name,
      props.color ?? null,
      now,
      now,
    );
  }

  static restore(props: RestoreFinanceTagProps): FinanceTag {
    return new FinanceTag(
      props.id,
      props.userId,
      props.name,
      props.color,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this._name = FinanceTag.validateName(name);
    this._updatedAt = new Date();
  }

  updateColor(color: string | null): void {
    this._color = color;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get color(): string | null { return this._color; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidFinanceTagNameError('nome nao pode ser vazio.');
    }
    if (trimmed.length > 50) {
      throw new InvalidFinanceTagNameError('nome nao pode ter mais de 50 caracteres.');
    }
    return trimmed;
  }
}
