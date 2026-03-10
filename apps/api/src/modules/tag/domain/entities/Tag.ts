import { InvalidTagNameError, InvalidTagColorError } from '../errors/TagErrors';

export interface CreateTagProps {
  userId: string;
  name: string;
  color: string;
}

export interface RestoreTagProps {
  id: string;
  userId: string;
  name: string;
  color: string;
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export class Tag {
  private constructor(
    private readonly _id: string | null,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _color: string,
  ) {}

  static create(props: CreateTagProps): Tag {
    const name = props.name?.trim();
    if (!name || name.length === 0) {
      throw new InvalidTagNameError();
    }
    if (name.length > 30) {
      throw new InvalidTagNameError();
    }
    if (!props.color || !HEX_COLOR_REGEX.test(props.color)) {
      throw new InvalidTagColorError();
    }
    return new Tag(null, props.userId, name, props.color);
  }

  static restore(props: RestoreTagProps): Tag {
    return new Tag(props.id, props.userId, props.name, props.color);
  }

  get id(): string | null { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get color(): string { return this._color; }
}
