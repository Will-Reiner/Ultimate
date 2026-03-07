import { ID } from '@shared/types';

export interface HabitEntryProps {
  id: ID;
  habitId: ID;
  completedAt: Date;
  value: number;
  note?: string;
}

export class HabitEntry {
  private constructor(private readonly props: HabitEntryProps) {}

  static create(props: HabitEntryProps): HabitEntry {
    return new HabitEntry(props);
  }

  get id(): ID { return this.props.id; }
  get habitId(): ID { return this.props.habitId; }
  get completedAt(): Date { return this.props.completedAt; }
  get value(): number { return this.props.value; }
  get note(): string | undefined { return this.props.note; }

  toJSON(): HabitEntryProps {
    return { ...this.props };
  }
}
