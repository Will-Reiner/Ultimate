import { Progress } from '../value-objects/Progress';
import {
  InvalidStudyItemTitleError,
  InvalidStudyItemTypeError,
  InvalidRatingError,
  InvalidStudyStatusTransitionError,
} from '../errors/StudyErrors';

export type StudyItemType = 'book' | 'course' | 'article' | 'podcast' | 'video' | 'other';
export type StudyItemStatus = 'backlog' | 'in_progress' | 'completed' | 'dropped';

const VALID_TYPES: StudyItemType[] = ['book', 'course', 'article', 'podcast', 'video', 'other'];

export interface CreateStudyItemProps {
  userId: string;
  title: string;
  description?: string | null;
  type: StudyItemType;
  url?: string | null;
  progress?: Progress;
  collectionId?: string | null;
}

export interface RestoreStudyItemProps {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: StudyItemType;
  url: string | null;
  progress: Progress;
  status: StudyItemStatus;
  rating: number | null;
  collectionId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class StudyItem {
  private _title: string;
  private _description: string | null;
  private _type: StudyItemType;
  private _url: string | null;
  private _progress: Progress;
  private _status: StudyItemStatus;
  private _rating: number | null;
  private _collectionId: string | null;
  private _startedAt: Date | null;
  private _completedAt: Date | null;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    title: string,
    description: string | null,
    type: StudyItemType,
    url: string | null,
    progress: Progress,
    status: StudyItemStatus,
    rating: number | null,
    collectionId: string | null,
    startedAt: Date | null,
    completedAt: Date | null,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    this._title = title;
    this._description = description;
    this._type = type;
    this._url = url;
    this._progress = progress;
    this._status = status;
    this._rating = rating;
    this._collectionId = collectionId;
    this._startedAt = startedAt;
    this._completedAt = completedAt;
  }

  static create(props: CreateStudyItemProps): StudyItem {
    const title = StudyItem.validateTitle(props.title);
    StudyItem.validateType(props.type);

    const now = new Date();
    return new StudyItem(
      '',
      props.userId,
      title,
      props.description ?? null,
      props.type,
      props.url ?? null,
      props.progress ?? Progress.create({ type: 'simple' }),
      'backlog',
      null,
      props.collectionId ?? null,
      null,
      null,
      now,
      now,
    );
  }

  static restore(props: RestoreStudyItemProps): StudyItem {
    return new StudyItem(
      props.id,
      props.userId,
      props.title,
      props.description,
      props.type,
      props.url,
      props.progress,
      props.status,
      props.rating,
      props.collectionId,
      props.startedAt,
      props.completedAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateTitle(title: string): void {
    this._title = StudyItem.validateTitle(title);
  }

  updateDescription(description: string | null): void {
    this._description = description;
  }

  updateType(type: StudyItemType): void {
    StudyItem.validateType(type);
    this._type = type;
  }

  updateUrl(url: string | null): void {
    this._url = url;
  }

  updateProgress(progress: Progress): void {
    this._progress = progress;

    // Auto-update status based on progress
    if (progress.isComplete()) {
      this._status = 'completed';
      this._completedAt = new Date();
      if (this._startedAt === null) {
        this._startedAt = new Date();
      }
    } else if (progress.isStarted()) {
      if (this._status === 'backlog') {
        this._status = 'in_progress';
      }
      if (this._startedAt === null) {
        this._startedAt = new Date();
      }
    }
  }

  setCollection(collectionId: string | null): void {
    this._collectionId = collectionId;
  }

  setRating(rating: number): void {
    if (this._status !== 'completed') {
      throw new InvalidRatingError('Rating só pode ser dado quando status = "completed".');
    }
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new InvalidRatingError('Rating deve ser um número inteiro entre 1 e 5.');
    }
    this._rating = rating;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  start(): void {
    if (this._status !== 'backlog') {
      throw new InvalidStudyStatusTransitionError(this._status, 'in_progress');
    }
    this._status = 'in_progress';
    if (this._startedAt === null) {
      this._startedAt = new Date();
    }
  }

  complete(): void {
    if (this._status !== 'in_progress') {
      throw new InvalidStudyStatusTransitionError(this._status, 'completed');
    }
    this._status = 'completed';
    this._completedAt = new Date();
  }

  drop(): void {
    if (this._status !== 'in_progress' && this._status !== 'backlog') {
      throw new InvalidStudyStatusTransitionError(this._status, 'dropped');
    }
    this._status = 'dropped';
  }

  reopen(): void {
    if (this._status !== 'dropped') {
      throw new InvalidStudyStatusTransitionError(this._status, 'in_progress');
    }
    this._status = 'in_progress';
  }

  restart(): void {
    if (this._status !== 'completed') {
      throw new InvalidStudyStatusTransitionError(this._status, 'in_progress');
    }
    this._status = 'in_progress';
    this._completedAt = null;
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get type(): StudyItemType { return this._type; }
  get url(): string | null { return this._url; }
  get progress(): Progress { return this._progress; }
  get status(): StudyItemStatus { return this._status; }
  get rating(): number | null { return this._rating; }
  get collectionId(): string | null { return this._collectionId; }
  get startedAt(): Date | null { return this._startedAt; }
  get completedAt(): Date | null { return this._completedAt; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateTitle(title: string): string {
    const trimmed = title.trim();
    if (trimmed.length === 0) {
      throw new InvalidStudyItemTitleError('título não pode ser vazio.');
    }
    if (trimmed.length > 200) {
      throw new InvalidStudyItemTitleError('título não pode ter mais de 200 caracteres.');
    }
    return trimmed;
  }

  private static validateType(type: string): asserts type is StudyItemType {
    if (!VALID_TYPES.includes(type as StudyItemType)) {
      throw new InvalidStudyItemTypeError(type);
    }
  }
}
