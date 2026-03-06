import { ID } from '@shared/types';
import { Frequency, FrequencyProps } from '../value-objects/Frequency';
import { HabitErrors } from '../errors/HabitErrors';

export interface HabitProps {
  id: ID;
  userId: ID;
  title: string;
  description?: string;
  emoji?: string;
  frequency: FrequencyProps;
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
  get frequency(): Frequency { return this._frequency; }
  get color(): string | undefined { return this.props.color; }
  get isArchived(): boolean { return this.props.isArchived; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isActiveToday(): boolean {
    return !this.isArchived && this._frequency.isActiveOn(new Date());
  }

  archive(): Habit {
    return Habit.restore({ ...this.props, isArchived: true, updatedAt: new Date() });
  }

  toJSON(): HabitProps {
    return { ...this.props };
  }
}
