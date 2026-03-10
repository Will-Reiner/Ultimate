import {
  InvalidEventTitleError,
  InvalidTimeFormatError,
  InvalidDaysOfWeekError,
} from '../errors/CalendarErrors';

export interface CreateHabitEventProps {
  userId: string;
  habitId: string;
  title: string;
  time: string;
  daysOfWeek: number[];
}

export interface RestoreHabitEventProps {
  id: string;
  userId: string;
  habitId: string;
  title: string;
  time: string;
  daysOfWeek: number[];
  createdAt: Date;
  updatedAt: Date;
}

export class HabitEvent {
  private _title: string;
  private _time: string;
  private _daysOfWeek: number[];
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _habitId: string,
    title: string,
    time: string,
    daysOfWeek: number[],
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._title = title;
    this._time = time;
    this._daysOfWeek = [...daysOfWeek];
    this._updatedAt = updatedAt;
  }

  static create(props: CreateHabitEventProps): HabitEvent {
    const title = HabitEvent.validateTitle(props.title);
    HabitEvent.validateTime(props.time);
    HabitEvent.validateDaysOfWeek(props.daysOfWeek);

    const now = new Date();
    return new HabitEvent(
      '',
      props.userId,
      props.habitId,
      title,
      props.time,
      props.daysOfWeek,
      now,
      now,
    );
  }

  static restore(props: RestoreHabitEventProps): HabitEvent {
    return new HabitEvent(
      props.id,
      props.userId,
      props.habitId,
      props.title,
      props.time,
      props.daysOfWeek,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTitle(title: string): void {
    this._title = HabitEvent.validateTitle(title);
    this._updatedAt = new Date();
  }

  updateTime(time: string): void {
    HabitEvent.validateTime(time);
    this._time = time;
    this._updatedAt = new Date();
  }

  updateDaysOfWeek(days: number[]): void {
    HabitEvent.validateDaysOfWeek(days);
    this._daysOfWeek = [...days];
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get habitId(): string { return this._habitId; }
  get title(): string { return this._title; }
  get time(): string { return this._time; }
  get daysOfWeek(): number[] { return [...this._daysOfWeek]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateTitle(title: string): string {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new InvalidEventTitleError('título não pode ser vazio.');
    }
    if (trimmed.length > 200) {
      throw new InvalidEventTitleError('título não pode ter mais de 200 caracteres.');
    }
    return trimmed;
  }

  private static validateTime(time: string): void {
    const match = /^(\d{2}):(\d{2})$/.exec(time);
    if (!match) {
      throw new InvalidTimeFormatError();
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new InvalidTimeFormatError();
    }
  }

  private static validateDaysOfWeek(days: number[]): void {
    if (days.length === 0) {
      throw new InvalidDaysOfWeekError();
    }
  }
}
