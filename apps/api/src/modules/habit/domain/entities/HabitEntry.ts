import {
  InvalidEntryValueError,
  InvalidIntensityError,
  UnauthorizedTrackingFieldError,
} from '../errors/HabitErrors';

export type EntryType = 'check_in' | 'relapse';

export interface CreateCheckInProps {
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  note?: string | null;
}

export interface CreateRelapseProps {
  habitId: string;
  date: string; // YYYY-MM-DD
  trackRelapseIntensity: boolean;
  trackRelapseTrigger: boolean;
  intensity?: number | null;
  trigger?: string | null;
  note?: string | null;
}

export interface RestoreEntryProps {
  id: string;
  habitId: string;
  date: string;
  entryType: EntryType;
  value: number;
  note: string | null;
  intensity: number | null;
  trigger: string | null;
  createdAt: Date;
}

export class HabitEntry {
  private constructor(
    private readonly _id: string,
    private readonly _habitId: string,
    private readonly _date: string,
    private readonly _entryType: EntryType,
    private readonly _value: number,
    private readonly _note: string | null,
    private readonly _intensity: number | null,
    private readonly _trigger: string | null,
    private readonly _createdAt: Date,
  ) {}

  static createCheckIn(props: CreateCheckInProps): HabitEntry {
    if (props.value <= 0) {
      throw new InvalidEntryValueError('valor deve ser maior que 0.');
    }

    return new HabitEntry(
      '',
      props.habitId,
      props.date,
      'check_in',
      props.value,
      props.note ?? null,
      null,
      null,
      new Date(),
    );
  }

  static createRelapse(props: CreateRelapseProps): HabitEntry {
    let intensity: number | null = null;
    let trigger: string | null = null;

    // Intensity validation
    if (props.intensity != null) {
      if (!props.trackRelapseIntensity) {
        throw new UnauthorizedTrackingFieldError('intensity');
      }
      if (props.intensity < 1 || props.intensity > 10) {
        throw new InvalidIntensityError();
      }
      intensity = props.intensity;
    }

    // Trigger validation
    if (props.trigger != null) {
      if (!props.trackRelapseTrigger) {
        throw new UnauthorizedTrackingFieldError('trigger');
      }
      trigger = props.trigger;
    }

    return new HabitEntry(
      '',
      props.habitId,
      props.date,
      'relapse',
      1,
      props.note ?? null,
      intensity,
      trigger,
      new Date(),
    );
  }

  static restore(props: RestoreEntryProps): HabitEntry {
    return new HabitEntry(
      props.id,
      props.habitId,
      props.date,
      props.entryType,
      props.value,
      props.note,
      props.intensity,
      props.trigger,
      props.createdAt,
    );
  }

  get id(): string { return this._id; }
  get habitId(): string { return this._habitId; }
  get date(): string { return this._date; }
  get entryType(): EntryType { return this._entryType; }
  get value(): number { return this._value; }
  get note(): string | null { return this._note; }
  get intensity(): number | null { return this._intensity; }
  get trigger(): string | null { return this._trigger; }
  get createdAt(): Date { return this._createdAt; }
}
