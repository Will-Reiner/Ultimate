import { InvalidCollectionNameError } from '../errors/StudyErrors';

export interface CreateCollectionProps {
  userId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

export interface RestoreCollectionProps {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Collection {
  private _name: string;
  private _description: string | null;
  private _color: string | null;
  private _icon: string | null;
  private _order: number;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    description: string | null,
    color: string | null,
    icon: string | null,
    order: number,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    this._name = name;
    this._description = description;
    this._color = color;
    this._icon = icon;
    this._order = order;
  }

  static create(props: CreateCollectionProps): Collection {
    const name = Collection.validateName(props.name);
    const now = new Date();
    return new Collection(
      '',
      props.userId,
      name,
      props.description ?? null,
      props.color ?? null,
      props.icon ?? null,
      props.order ?? 0,
      now,
      now,
    );
  }

  static restore(props: RestoreCollectionProps): Collection {
    return new Collection(
      props.id,
      props.userId,
      props.name,
      props.description,
      props.color,
      props.icon,
      props.order,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this._name = Collection.validateName(name);
  }

  updateDescription(description: string | null): void {
    this._description = description;
  }

  updateColor(color: string | null): void {
    this._color = color;
  }

  updateIcon(icon: string | null): void {
    this._icon = icon;
  }

  updateOrder(order: number): void {
    this._order = order;
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get color(): string | null { return this._color; }
  get icon(): string | null { return this._icon; }
  get order(): number { return this._order; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidCollectionNameError('nome não pode ser vazio.');
    }
    if (trimmed.length > 100) {
      throw new InvalidCollectionNameError('nome não pode ter mais de 100 caracteres.');
    }
    return trimmed;
  }
}
