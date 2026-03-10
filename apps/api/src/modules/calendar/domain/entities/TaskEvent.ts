import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

export interface CreateTaskEventProps {
  userId: string;
  taskId: string;
  projectId?: string | null;
  title: string;
  startAt: Date;
  endAt?: Date | null;
  reminders?: EventReminder[];
}

export interface RestoreTaskEventProps {
  id: string;
  userId: string;
  taskId: string;
  projectId: string | null;
  title: string;
  startAt: Date;
  endAt: Date | null;
  reminders: EventReminder[];
  completedAt: Date | null;
  googleTaskId: string | null;
  syncWithGoogle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TaskEvent {
  private _title: string;
  private _startAt: Date;
  private _endAt: Date | null;
  private _reminders: EventReminder[];
  private _completedAt: Date | null;
  private _googleTaskId: string | null;
  private _syncWithGoogle: boolean;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _taskId: string,
    private readonly _projectId: string | null,
    title: string,
    startAt: Date,
    endAt: Date | null,
    reminders: EventReminder[],
    completedAt: Date | null,
    googleTaskId: string | null,
    syncWithGoogle: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._title = title;
    this._startAt = startAt;
    this._endAt = endAt;
    this._reminders = reminders;
    this._completedAt = completedAt;
    this._googleTaskId = googleTaskId;
    this._syncWithGoogle = syncWithGoogle;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateTaskEventProps): TaskEvent {
    const title = TaskEvent.validateTitle(props.title);
    const endAt = props.endAt ?? null;
    if (endAt !== null) {
      TaskEvent.validateTimeRange(props.startAt, endAt);
    }

    const now = new Date();
    return new TaskEvent(
      '',
      props.userId,
      props.taskId,
      props.projectId ?? null,
      title,
      props.startAt,
      endAt,
      props.reminders ?? [],
      null,
      null,
      true,
      now,
      now,
    );
  }

  static restore(props: RestoreTaskEventProps): TaskEvent {
    return new TaskEvent(
      props.id,
      props.userId,
      props.taskId,
      props.projectId,
      props.title,
      props.startAt,
      props.endAt,
      props.reminders,
      props.completedAt,
      props.googleTaskId,
      props.syncWithGoogle,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTitle(title: string): void {
    this._title = TaskEvent.validateTitle(title);
    this._updatedAt = new Date();
  }

  updateTime(startAt: Date, endAt: Date | null): void {
    if (endAt !== null) {
      TaskEvent.validateTimeRange(startAt, endAt);
    }
    this._startAt = startAt;
    this._endAt = endAt;
    this._updatedAt = new Date();
  }

  complete(): void {
    this._completedAt = new Date();
    this._updatedAt = new Date();
  }

  uncomplete(): void {
    this._completedAt = null;
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get taskId(): string { return this._taskId; }
  get projectId(): string | null { return this._projectId; }
  get title(): string { return this._title; }
  get startAt(): Date { return this._startAt; }
  get endAt(): Date | null { return this._endAt; }
  get reminders(): EventReminder[] { return [...this._reminders]; }
  get completedAt(): Date | null { return this._completedAt; }
  get googleTaskId(): string | null { return this._googleTaskId; }
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
