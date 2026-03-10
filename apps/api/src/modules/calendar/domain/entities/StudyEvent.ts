import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

export interface CreateStudyEventProps {
  userId: string;
  studyItemId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  reminders?: EventReminder[];
}

export interface RestoreStudyEventProps {
  id: string;
  userId: string;
  studyItemId: string;
  title: string;
  startAt: Date;
  endAt: Date;
  reminders: EventReminder[];
  googleEventId: string | null;
  syncWithGoogle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class StudyEvent {
  private _title: string;
  private _startAt: Date;
  private _endAt: Date;
  private _reminders: EventReminder[];
  private _googleEventId: string | null;
  private _syncWithGoogle: boolean;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _studyItemId: string,
    title: string,
    startAt: Date,
    endAt: Date,
    reminders: EventReminder[],
    googleEventId: string | null,
    syncWithGoogle: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._title = title;
    this._startAt = startAt;
    this._endAt = endAt;
    this._reminders = reminders;
    this._googleEventId = googleEventId;
    this._syncWithGoogle = syncWithGoogle;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateStudyEventProps): StudyEvent {
    const title = StudyEvent.validateTitle(props.title);
    StudyEvent.validateTimeRange(props.startAt, props.endAt);

    const now = new Date();
    return new StudyEvent(
      '',
      props.userId,
      props.studyItemId,
      title,
      props.startAt,
      props.endAt,
      props.reminders ?? [],
      null,
      true,
      now,
      now,
    );
  }

  static restore(props: RestoreStudyEventProps): StudyEvent {
    return new StudyEvent(
      props.id,
      props.userId,
      props.studyItemId,
      props.title,
      props.startAt,
      props.endAt,
      props.reminders,
      props.googleEventId,
      props.syncWithGoogle,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTitle(title: string): void {
    this._title = StudyEvent.validateTitle(title);
    this._updatedAt = new Date();
  }

  updateTime(startAt: Date, endAt: Date): void {
    StudyEvent.validateTimeRange(startAt, endAt);
    this._startAt = startAt;
    this._endAt = endAt;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get studyItemId(): string { return this._studyItemId; }
  get title(): string { return this._title; }
  get startAt(): Date { return this._startAt; }
  get endAt(): Date { return this._endAt; }
  get reminders(): EventReminder[] { return [...this._reminders]; }
  get googleEventId(): string | null { return this._googleEventId; }
  get syncWithGoogle(): boolean { return this._syncWithGoogle; }
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

  private static validateTimeRange(startAt: Date, endAt: Date): void {
    if (endAt <= startAt) {
      throw new InvalidEventTimeRangeError();
    }
  }
}
