import { Frequency } from '../value-objects/Frequency';
import { Goal } from '../value-objects/Goal';
import {
  InvalidHabitNameError,
  ImmutableTypeError,
  InvalidTrackingModeError,
  InvalidStatusTransitionError,
  InvalidReminderTimeError,
} from '../errors/HabitErrors';

export type HabitType = 'build' | 'quit';
export type TrackingMode = 'boolean' | 'quantitative';
export type HabitStatus = 'active' | 'paused' | 'archived';

export interface CreateHabitProps {
  userId: string;
  name: string;
  description?: string | null;
  type: HabitType;
  trackingMode: TrackingMode;
  dailyTarget?: number | null;
  targetUnit?: string | null;
  frequency: Frequency;
  goal?: Goal | null;
  categoryId?: string | null;
  tags?: string[];
  reminders?: string[];
  trackRelapseIntensity?: boolean;
  trackRelapseTrigger?: boolean;
}

export interface RestoreHabitProps {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  type: HabitType;
  trackingMode: TrackingMode;
  dailyTarget: number | null;
  targetUnit: string | null;
  frequency: Frequency;
  goal: Goal | null;
  categoryId: string | null;
  tags: string[];
  reminders: string[];
  status: HabitStatus;
  trackRelapseIntensity: boolean;
  trackRelapseTrigger: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class Habit {
  private _name: string;
  private _description: string | null;
  private _frequency: Frequency;
  private _goal: Goal | null;
  private _categoryId: string | null;
  private _tags: string[];
  private _reminders: string[];
  private _status: HabitStatus;
  private _dailyTarget: number | null;
  private _targetUnit: string | null;

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    name: string,
    description: string | null,
    private readonly _type: HabitType,
    private readonly _trackingMode: TrackingMode,
    dailyTarget: number | null,
    targetUnit: string | null,
    frequency: Frequency,
    goal: Goal | null,
    categoryId: string | null,
    tags: string[],
    reminders: string[],
    status: HabitStatus,
    private readonly _trackRelapseIntensity: boolean,
    private readonly _trackRelapseTrigger: boolean,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date,
  ) {
    this._name = name;
    this._description = description;
    this._dailyTarget = dailyTarget;
    this._targetUnit = targetUnit;
    this._frequency = frequency;
    this._goal = goal;
    this._categoryId = categoryId;
    this._tags = tags;
    this._reminders = reminders;
    this._status = status;
  }

  static create(props: CreateHabitProps): Habit {
    const name = Habit.validateName(props.name);

    if (props.trackingMode !== 'boolean' && props.trackingMode !== 'quantitative') {
      throw new InvalidTrackingModeError(`Tracking mode deve ser "boolean" ou "quantitative".`);
    }

    if (props.trackingMode === 'quantitative') {
      if (!props.dailyTarget || props.dailyTarget <= 0) {
        throw new InvalidTrackingModeError('dailyTarget é obrigatório e deve ser > 0 para modo quantitativo.');
      }
      if (!props.targetUnit || props.targetUnit.trim() === '') {
        throw new InvalidTrackingModeError('targetUnit é obrigatório para modo quantitativo.');
      }
    }

    if (!props.frequency) {
      throw new Error('Frequência é obrigatória.');
    }

    // Ignorar trackRelapse* para tipo build
    const trackRelapseIntensity = props.type === 'quit' ? (props.trackRelapseIntensity ?? false) : false;
    const trackRelapseTrigger = props.type === 'quit' ? (props.trackRelapseTrigger ?? false) : false;

    const now = new Date();
    return new Habit(
      '', // id será atribuído pelo banco
      props.userId,
      name,
      props.description ?? null,
      props.type,
      props.trackingMode,
      props.trackingMode === 'quantitative' ? props.dailyTarget! : null,
      props.trackingMode === 'quantitative' ? props.targetUnit!.trim() : null,
      props.frequency,
      props.goal ?? null,
      props.categoryId ?? null,
      props.tags ?? [],
      props.reminders ?? [],
      'active',
      trackRelapseIntensity,
      trackRelapseTrigger,
      now,
      now,
    );
  }

  static restore(props: RestoreHabitProps): Habit {
    return new Habit(
      props.id,
      props.userId,
      props.name,
      props.description,
      props.type,
      props.trackingMode,
      props.dailyTarget,
      props.targetUnit,
      props.frequency,
      props.goal,
      props.categoryId,
      props.tags,
      props.reminders,
      props.status,
      props.trackRelapseIntensity,
      props.trackRelapseTrigger,
      props.createdAt,
      props.updatedAt,
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  updateName(name: string): void {
    this._name = Habit.validateName(name);
  }

  updateDescription(description: string | null): void {
    this._description = description;
  }

  updateType(_type: string): void {
    throw new ImmutableTypeError();
  }

  updateFrequency(frequency: Frequency): void {
    this._frequency = frequency;
  }

  updateDailyTarget(dailyTarget: number, targetUnit: string): void {
    this._dailyTarget = dailyTarget;
    this._targetUnit = targetUnit;
  }

  setCategory(categoryId: string | null): void {
    this._categoryId = categoryId;
  }

  addTag(tagId: string): void {
    if (!this._tags.includes(tagId)) {
      this._tags.push(tagId);
    }
  }

  removeTag(tagId: string): void {
    this._tags = this._tags.filter((t) => t !== tagId);
  }

  setReminders(times: string[]): void {
    for (const t of times) {
      if (!TIME_REGEX.test(t)) {
        throw new InvalidReminderTimeError();
      }
    }
    this._reminders = [...times];
  }

  setGoal(goal: Goal | null): void {
    this._goal = goal;
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────

  pause(): void {
    if (this._status !== 'active') {
      throw new InvalidStatusTransitionError(this._status, 'paused');
    }
    this._status = 'paused';
  }

  archive(): void {
    if (this._status !== 'active') {
      throw new InvalidStatusTransitionError(this._status, 'archived');
    }
    this._status = 'archived';
  }

  reactivate(): void {
    if (this._status === 'active') {
      throw new InvalidStatusTransitionError(this._status, 'active');
    }
    this._status = 'active';
  }

  // ─── Getters ───────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get type(): HabitType { return this._type; }
  get trackingMode(): TrackingMode { return this._trackingMode; }
  get dailyTarget(): number | null { return this._dailyTarget; }
  get targetUnit(): string | null { return this._targetUnit; }
  get frequency(): Frequency { return this._frequency; }
  get goal(): Goal | null { return this._goal; }
  get categoryId(): string | null { return this._categoryId; }
  get tags(): string[] { return [...this._tags]; }
  get reminders(): string[] { return [...this._reminders]; }
  get status(): HabitStatus { return this._status; }
  get trackRelapseIntensity(): boolean { return this._trackRelapseIntensity; }
  get trackRelapseTrigger(): boolean { return this._trackRelapseTrigger; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Private ───────────────────────────────────────────────────────────

  private static validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new InvalidHabitNameError('nome não pode ser vazio.');
    }
    if (trimmed.length > 100) {
      throw new InvalidHabitNameError('nome não pode ter mais de 100 caracteres.');
    }
    return trimmed;
  }
}
