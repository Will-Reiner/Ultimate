import { InvalidStudySessionError } from '../errors/StudyErrors';

export type StudySessionStatus = 'scheduled' | 'completed' | 'skipped';

export interface CreateStudySessionProps {
  studyItemId: string;
  userId: string;
  scheduledAt: Date;
  durationMinutes: number;
}

export interface RestoreStudySessionProps {
  id: string;
  studyItemId: string;
  userId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: StudySessionStatus;
  calendarEventId: string | null;
  completedAt: Date | null;
  createdAt: Date;
}

export class StudySession {
  private _scheduledAt: Date;
  private _durationMinutes: number;
  private _status: StudySessionStatus;
  private _calendarEventId: string | null;
  private _completedAt: Date | null;

  private constructor(
    private readonly _id: string,
    private readonly _studyItemId: string,
    private readonly _userId: string,
    scheduledAt: Date,
    durationMinutes: number,
    status: StudySessionStatus,
    calendarEventId: string | null,
    completedAt: Date | null,
    private readonly _createdAt: Date,
  ) {
    this._scheduledAt = scheduledAt;
    this._durationMinutes = durationMinutes;
    this._status = status;
    this._calendarEventId = calendarEventId;
    this._completedAt = completedAt;
  }

  static create(props: CreateStudySessionProps): StudySession {
    StudySession.validateDuration(props.durationMinutes);

    const now = new Date();
    return new StudySession(
      '',
      props.studyItemId,
      props.userId,
      props.scheduledAt,
      props.durationMinutes,
      'scheduled',
      null,
      null,
      now,
    );
  }

  static restore(props: RestoreStudySessionProps): StudySession {
    return new StudySession(
      props.id,
      props.studyItemId,
      props.userId,
      props.scheduledAt,
      props.durationMinutes,
      props.status,
      props.calendarEventId,
      props.completedAt,
      props.createdAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  complete(): void {
    this._status = 'completed';
    this._completedAt = new Date();
  }

  skip(): void {
    this._status = 'skipped';
  }

  reschedule(scheduledAt: Date, durationMinutes: number): void {
    StudySession.validateDuration(durationMinutes);
    this._scheduledAt = scheduledAt;
    this._durationMinutes = durationMinutes;
  }

  setCalendarEventId(calendarEventId: string | null): void {
    this._calendarEventId = calendarEventId;
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get studyItemId(): string { return this._studyItemId; }
  get userId(): string { return this._userId; }
  get scheduledAt(): Date { return this._scheduledAt; }
  get durationMinutes(): number { return this._durationMinutes; }
  get status(): StudySessionStatus { return this._status; }
  get calendarEventId(): string | null { return this._calendarEventId; }
  get completedAt(): Date | null { return this._completedAt; }
  get createdAt(): Date { return this._createdAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateDuration(durationMinutes: number): void {
    if (durationMinutes <= 0) {
      throw new InvalidStudySessionError('duração deve ser maior que 0 minutos.');
    }
  }
}
