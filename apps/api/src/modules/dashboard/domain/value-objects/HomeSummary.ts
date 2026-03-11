export interface HomeSummaryData {
  pendingHabits: number;
  todayTasks: number;
  nextEvents: { id: string; title: string; startAt: Date }[];
  todayMood: number | null;
  habitCompletionToday: number;
  taskCompletionThisWeek: number;
  topStreaks: { habitId: string; name: string; currentStreak: number }[];
}

export class HomeSummary {
  private constructor(private readonly data: HomeSummaryData) {}

  static create(data: HomeSummaryData): HomeSummary {
    return new HomeSummary(data);
  }

  get pendingHabits(): number {
    return this.data.pendingHabits;
  }

  get todayTasks(): number {
    return this.data.todayTasks;
  }

  get nextEvents(): { id: string; title: string; startAt: Date }[] {
    return this.data.nextEvents;
  }

  get todayMood(): number | null {
    return this.data.todayMood;
  }

  get habitCompletionToday(): number {
    return this.data.habitCompletionToday;
  }

  get taskCompletionThisWeek(): number {
    return this.data.taskCompletionThisWeek;
  }

  get topStreaks(): { habitId: string; name: string; currentStreak: number }[] {
    return this.data.topStreaks;
  }

  toJSON(): HomeSummaryData {
    return { ...this.data };
  }
}
