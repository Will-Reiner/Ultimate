import { InvalidStudyTagNameError } from '../errors/StudyErrors';

export interface CreateStudyTagProps {
  userId: string;
  name: string;
  color?: string | null;
}

export interface RestoreStudyTagProps {
  id: string;
  userId: string;
  name: string;
  color: string | null;
}

export class StudyTag {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _name: string,
    private readonly _color: string | null,
  ) {}

  static create(props: CreateStudyTagProps): StudyTag {
    const name = props.name.trim();
    if (name.length === 0) {
      throw new InvalidStudyTagNameError('nome não pode ser vazio.');
    }
    return new StudyTag('', props.userId, name, props.color ?? null);
  }

  static restore(props: RestoreStudyTagProps): StudyTag {
    return new StudyTag(props.id, props.userId, props.name, props.color);
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get color(): string | null { return this._color; }
}
