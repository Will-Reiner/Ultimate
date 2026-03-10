import { InvalidTaskTagNameError } from '../errors/TaskErrors';

export interface RestoreTaskTagProps {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TaskTag {
  private _name: string;
  private _color: string;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    color: string,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._name = name;
    this._color = color;
    this._updatedAt = updatedAt;
  }

  static create(props: { userId: string; name: string; color: string }): TaskTag {
    const name = TaskTag.validateName(props.name);
    const now = new Date();
    return new TaskTag('', props.userId, name, props.color, now, now);
  }

  static restore(props: RestoreTaskTagProps): TaskTag {
    const now = new Date();
    return new TaskTag(
      props.id,
      props.userId,
      props.name,
      props.color,
      props.createdAt ?? now,
      props.updatedAt ?? now,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this._name = TaskTag.validateName(name);
    this._updatedAt = new Date();
  }

  updateColor(color: string): void {
    this._color = color;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get color(): string { return this._color; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidTaskTagNameError('nome nao pode ser vazio.');
    }
    return trimmed;
  }
}
