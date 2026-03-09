export interface HabitProps {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  frequencyType: string;
  daysOfWeek: number[];
  goalValue: number | null;
  goalUnit: string | null;
  reminderTime: string | null;
  color: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Habit {
  private constructor(private readonly props: HabitProps) {}

  static restore(props: HabitProps): Habit {
    return new Habit(props);
  }

  get id(): string { return this.props.id; }
  get userId(): string { return this.props.userId; }
  get title(): string { return this.props.title; }
  get description(): string | null { return this.props.description; }
  get emoji(): string | null { return this.props.emoji; }
  get type(): string { return this.props.type; }
  get frequencyType(): string { return this.props.frequencyType; }
  get daysOfWeek(): number[] { return this.props.daysOfWeek; }
  get goalValue(): number | null { return this.props.goalValue; }
  get goalUnit(): string | null { return this.props.goalUnit; }
  get reminderTime(): string | null { return this.props.reminderTime; }
  get color(): string | null { return this.props.color; }
  get isArchived(): boolean { return this.props.isArchived; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
