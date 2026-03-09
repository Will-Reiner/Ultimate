export interface HabitEntryProps {
  id: string;
  habitId: string;
  completedAt: Date;
  value: number;
  note: string | null;
}

export class HabitEntry {
  private constructor(private readonly props: HabitEntryProps) {}

  static restore(props: HabitEntryProps): HabitEntry {
    return new HabitEntry(props);
  }

  get id(): string { return this.props.id; }
  get habitId(): string { return this.props.habitId; }
  get completedAt(): Date { return this.props.completedAt; }
  get value(): number { return this.props.value; }
  get note(): string | null { return this.props.note; }
}
