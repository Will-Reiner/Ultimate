import {
  InvalidJournalTagNameError,
  PredefinedTagImmutableError,
} from '../errors/JournalErrors';

export interface RestoreJournalTagProps {
  id: string;
  name: string;
  isPredefined: boolean;
  userId: string | null;
}

export class JournalTag {
  static readonly PREDEFINED_TAGS: string[] = [
    'Pensamentos',
    'Ideias',
    'Emoções',
    'Gratidão',
    'Desabafo',
    'Reflexão',
  ];

  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _isPredefined: boolean,
    private readonly _userId: string | null,
  ) {}

  static createUserTag(props: { name: string; userId: string }): JournalTag {
    const trimmed = props.name.trim();
    if (trimmed.length === 0) {
      throw new InvalidJournalTagNameError('nome não pode ser vazio.');
    }
    return new JournalTag('', trimmed, false, props.userId);
  }

  static createPredefined(props: { id: string; name: string }): JournalTag {
    return new JournalTag(props.id, props.name, true, null);
  }

  static restore(props: RestoreJournalTagProps): JournalTag {
    return new JournalTag(props.id, props.name, props.isPredefined, props.userId);
  }

  validateCanDelete(): void {
    if (this._isPredefined) {
      throw new PredefinedTagImmutableError();
    }
  }

  validateCanEdit(): void {
    if (this._isPredefined) {
      throw new PredefinedTagImmutableError();
    }
  }

  get id(): string { return this._id; }
  get name(): string { return this._name; }
  get isPredefined(): boolean { return this._isPredefined; }
  get userId(): string | null { return this._userId; }
}
