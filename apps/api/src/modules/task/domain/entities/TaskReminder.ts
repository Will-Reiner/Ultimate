import { InvalidTaskReminderError } from '../errors/TaskErrors';

export interface CreateTaskReminderProps {
  taskId: string;
  remindAt: Date;
  syncsToCalendar?: boolean;
}

export interface RestoreTaskReminderProps {
  id: string;
  taskId: string;
  remindAt: Date;
  syncsToCalendar: boolean;
  calendarEventId: string | null;
  createdAt: Date;
}

export class TaskReminder {
  private _calendarEventId: string | null;
  private _remindAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _taskId: string,
    remindAt: Date,
    private readonly _syncsToCalendar: boolean,
    calendarEventId: string | null,
    private readonly _createdAt: Date,
  ) {
    this._remindAt = remindAt;
    this._calendarEventId = calendarEventId;
  }

  static create(props: CreateTaskReminderProps): TaskReminder {
    TaskReminder.validateFutureDate(props.remindAt);

    const now = new Date();
    return new TaskReminder(
      '',
      props.taskId,
      props.remindAt,
      props.syncsToCalendar ?? true,
      null,
      now,
    );
  }

  static restore(props: RestoreTaskReminderProps): TaskReminder {
    return new TaskReminder(
      props.id,
      props.taskId,
      props.remindAt,
      props.syncsToCalendar,
      props.calendarEventId,
      props.createdAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateRemindAt(remindAt: Date): void {
    TaskReminder.validateFutureDate(remindAt);
    this._remindAt = remindAt;
  }

  setCalendarEventId(eventId: string): void {
    this._calendarEventId = eventId;
  }

  clearCalendarEventId(): void {
    this._calendarEventId = null;
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get taskId(): string { return this._taskId; }
  get remindAt(): Date { return this._remindAt; }
  get syncsToCalendar(): boolean { return this._syncsToCalendar; }
  get calendarEventId(): string | null { return this._calendarEventId; }
  get createdAt(): Date { return this._createdAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateFutureDate(date: Date): void {
    if (date <= new Date()) {
      throw new InvalidTaskReminderError('data/hora deve ser no futuro');
    }
  }
}
