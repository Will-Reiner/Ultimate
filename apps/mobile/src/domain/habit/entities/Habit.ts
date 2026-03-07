import { ID } from '@shared/types';
import { Frequency, FrequencyProps } from '../value-objects/Frequency';
import { HabitErrors } from '../errors/HabitErrors';

export type HabitType = 'build' | 'quit';

export interface HabitProps {
  id: ID;
  userId: ID;
  title: string;
  description?: string;
  emoji?: string;
  type: HabitType;
  frequency: FrequencyProps;
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Habit {
  private readonly _frequency: Frequency;

  private constructor(private readonly props: HabitProps) {
    this._frequency = Frequency.create(props.frequency);
  }

  static create(props: HabitProps): Habit {
    if (!props.title || props.title.trim().length === 0) {
      throw HabitErrors.invalidTitle();
    }
    if (!['build', 'quit'].includes(props.type)) {
      throw HabitErrors.invalidType();
    }
    if (props.goalValue !== undefined && props.goalValue <= 0) {
      throw HabitErrors.invalidGoal();
    }
    if (props.reminderTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(props.reminderTime)) {
      throw HabitErrors.invalidReminderTime();
    }
    return new Habit({ ...props, title: props.title.trim() });
  }

  static restore(props: HabitProps): Habit {
    return new Habit(props);
  }

  get id(): ID { return this.props.id; }
  get userId(): ID { return this.props.userId; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get emoji(): string | undefined { return this.props.emoji; }
  get type(): HabitType { return this.props.type; }
  get frequency(): Frequency { return this._frequency; }
  get goalValue(): number | undefined { return this.props.goalValue; }
  get goalUnit(): string | undefined { return this.props.goalUnit; }
  get reminderTime(): string | undefined { return this.props.reminderTime; }
  get color(): string | undefined { return this.props.color; }
  get isArchived(): boolean { return this.props.isArchived; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get hasQuantityGoal(): boolean {
    return this.props.goalValue !== undefined && this.props.goalValue > 0;
  }

  get isBuildHabit(): boolean { return this.props.type === 'build'; }
  get isQuitHabit(): boolean { return this.props.type === 'quit'; }

  isActiveToday(): boolean {
    return !this.isArchived && this._frequency.isActiveOn(new Date());
  }

  archive(): Habit {
    return Habit.restore({ ...this.props, isArchived: true, updatedAt: new Date() });
  }

  updateWith(changes: Partial<Omit<HabitProps, 'id' | 'userId' | 'createdAt'>>): Habit {
    return Habit.create({
      ...this.props,
      ...changes,
      updatedAt: new Date(),
    });
  }

  toJSON(): HabitProps {
    return { ...this.props };
  }
}
