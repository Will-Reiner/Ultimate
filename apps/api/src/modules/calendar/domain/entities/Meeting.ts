import { Participant } from '../value-objects/Participant';
import { Recurrence } from '../value-objects/Recurrence';
import { EventReminder } from '../value-objects/EventReminder';
import {
  InvalidEventTitleError,
  InvalidEventTimeRangeError,
} from '../errors/CalendarErrors';

export type MeetingStatus = 'scheduled' | 'cancelled';

export interface CreateMeetingProps {
  userId: string;
  title: string;
  description?: string | null;
  startAt: Date;
  endAt: Date;
  isAllDay?: boolean;
  location?: string | null;
  conferenceLink?: string | null;
  participants?: Participant[];
  agenda?: string | null;
  recurrence?: Recurrence | null;
  reminders?: EventReminder[];
  color?: string | null;
}

export interface RestoreMeetingProps {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  isAllDay: boolean;
  location: string | null;
  conferenceLink: string | null;
  participants: Participant[];
  agenda: string | null;
  meetingNotes: string | null;
  recurrence: Recurrence | null;
  reminders: EventReminder[];
  status: MeetingStatus;
  color: string | null;
  googleEventId: string | null;
  syncWithGoogle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Meeting {
  private _title: string;
  private _description: string | null;
  private _startAt: Date;
  private _endAt: Date;
  private _isAllDay: boolean;
  private _location: string | null;
  private _conferenceLink: string | null;
  private _participants: Participant[];
  private _agenda: string | null;
  private _meetingNotes: string | null;
  private _recurrence: Recurrence | null;
  private _reminders: EventReminder[];
  private _status: MeetingStatus;
  private _color: string | null;
  private _googleEventId: string | null;
  private _syncWithGoogle: boolean;
  private _updatedAt: Date;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    title: string,
    description: string | null,
    startAt: Date,
    endAt: Date,
    isAllDay: boolean,
    location: string | null,
    conferenceLink: string | null,
    participants: Participant[],
    agenda: string | null,
    meetingNotes: string | null,
    recurrence: Recurrence | null,
    reminders: EventReminder[],
    status: MeetingStatus,
    color: string | null,
    googleEventId: string | null,
    syncWithGoogle: boolean,
    private readonly _createdAt: Date,
    updatedAt: Date,
  ) {
    this._title = title;
    this._description = description;
    this._startAt = startAt;
    this._endAt = endAt;
    this._isAllDay = isAllDay;
    this._location = location;
    this._conferenceLink = conferenceLink;
    this._participants = participants;
    this._agenda = agenda;
    this._meetingNotes = meetingNotes;
    this._recurrence = recurrence;
    this._reminders = reminders;
    this._status = status;
    this._color = color;
    this._googleEventId = googleEventId;
    this._syncWithGoogle = syncWithGoogle;
    this._updatedAt = updatedAt;
  }

  static create(props: CreateMeetingProps): Meeting {
    const title = Meeting.validateTitle(props.title);
    Meeting.validateTimeRange(props.startAt, props.endAt);

    const now = new Date();
    return new Meeting(
      '',
      props.userId,
      title,
      props.description ?? null,
      props.startAt,
      props.endAt,
      props.isAllDay ?? false,
      props.location ?? null,
      props.conferenceLink ?? null,
      props.participants ?? [],
      props.agenda ?? null,
      null,
      props.recurrence ?? null,
      props.reminders ?? [],
      'scheduled',
      props.color ?? null,
      null,
      true,
      now,
      now,
    );
  }

  static restore(props: RestoreMeetingProps): Meeting {
    return new Meeting(
      props.id,
      props.userId,
      props.title,
      props.description,
      props.startAt,
      props.endAt,
      props.isAllDay,
      props.location,
      props.conferenceLink,
      props.participants,
      props.agenda,
      props.meetingNotes,
      props.recurrence,
      props.reminders,
      props.status,
      props.color,
      props.googleEventId,
      props.syncWithGoogle,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTitle(title: string): void {
    this._title = Meeting.validateTitle(title);
    this._updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  updateTime(startAt: Date, endAt: Date): void {
    Meeting.validateTimeRange(startAt, endAt);
    this._startAt = startAt;
    this._endAt = endAt;
    this._updatedAt = new Date();
  }

  updateLocation(location: string | null): void {
    this._location = location;
    this._updatedAt = new Date();
  }

  updateConferenceLink(link: string | null): void {
    this._conferenceLink = link;
    this._updatedAt = new Date();
  }

  updateAgenda(agenda: string | null): void {
    this._agenda = agenda;
    this._updatedAt = new Date();
  }

  updateMeetingNotes(notes: string | null): void {
    this._meetingNotes = notes;
    this._updatedAt = new Date();
  }

  updateRecurrence(recurrence: Recurrence | null): void {
    this._recurrence = recurrence;
    this._updatedAt = new Date();
  }

  addParticipant(name: string, email?: string): void {
    const participant = Participant.create({ name, email });
    this._participants.push(participant);
    this._updatedAt = new Date();
  }

  removeParticipant(index: number): void {
    this._participants.splice(index, 1);
    this._updatedAt = new Date();
  }

  addReminder(minutesBefore: number): void {
    const reminder = EventReminder.create({ minutesBefore });
    this._reminders.push(reminder);
    this._reminders.sort((a, b) => b.minutesBefore - a.minutesBefore);
    this._updatedAt = new Date();
  }

  removeReminder(index: number): void {
    this._reminders.splice(index, 1);
    this._updatedAt = new Date();
  }

  cancel(): void {
    this._status = 'cancelled';
    this._updatedAt = new Date();
  }

  reactivate(): void {
    this._status = 'scheduled';
    this._updatedAt = new Date();
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get startAt(): Date { return this._startAt; }
  get endAt(): Date { return this._endAt; }
  get isAllDay(): boolean { return this._isAllDay; }
  get location(): string | null { return this._location; }
  get conferenceLink(): string | null { return this._conferenceLink; }
  get participants(): Participant[] { return [...this._participants]; }
  get agenda(): string | null { return this._agenda; }
  get meetingNotes(): string | null { return this._meetingNotes; }
  get recurrence(): Recurrence | null { return this._recurrence; }
  get reminders(): EventReminder[] { return [...this._reminders]; }
  get status(): MeetingStatus { return this._status; }
  get color(): string | null { return this._color; }
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
