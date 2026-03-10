import { randomUUID } from 'crypto';
import { InvalidTaskStatusError } from '../errors/TaskErrors';

export type TaskStatusType = 'todo' | 'in_progress' | 'done';

const VALID_TYPES: TaskStatusType[] = ['todo', 'in_progress', 'done'];
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export class TaskStatus {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _type: TaskStatusType,
    private readonly _color: string,
    private readonly _isDefault: boolean,
  ) {}

  static create(props: { name: string; type: TaskStatusType; color: string }): TaskStatus {
    const name = props.name?.trim();
    if (!name || name.length === 0) {
      throw new InvalidTaskStatusError('nome nao pode ser vazio');
    }

    if (!VALID_TYPES.includes(props.type)) {
      throw new InvalidTaskStatusError(`type invalido: ${props.type}`);
    }

    if (!props.color || !HEX_COLOR_REGEX.test(props.color)) {
      throw new InvalidTaskStatusError('cor deve ser hexadecimal valida (#RRGGBB)');
    }

    return new TaskStatus(randomUUID(), name, props.type, props.color, false);
  }

  static restore(props: {
    id: string;
    name: string;
    type: TaskStatusType;
    color: string;
    isDefault: boolean;
  }): TaskStatus {
    return new TaskStatus(props.id, props.name, props.type, props.color, props.isDefault);
  }

  static createDefaults(): TaskStatus[] {
    return [
      new TaskStatus(randomUUID(), 'To Do', 'todo', '#888888', true),
      new TaskStatus(randomUUID(), 'In Progress', 'in_progress', '#3B82F6', true),
      new TaskStatus(randomUUID(), 'Done', 'done', '#22C55E', true),
    ];
  }

  isDone(): boolean {
    return this._type === 'done';
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get type(): TaskStatusType { return this._type; }
  get color(): string { return this._color; }
  get isDefault(): boolean { return this._isDefault; }
}
