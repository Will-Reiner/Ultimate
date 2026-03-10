export interface HabitInput {
  id: string;
  name: string;
  type: 'build' | 'quit';
  status: 'active' | 'paused' | 'archived';
  trackingMode: 'boolean' | 'quantitative';
  frequencyType: 'daily' | 'weekly' | 'specific_days' | 'interval';
  frequencyDays: number[];
  frequencyTimesPerWeek: number | null;
  frequencyEveryNDays: number | null;
  dailyTarget: number | null;
  createdAt: Date;
  currentStreak: number;
}

export interface HabitEntryInput {
  habitId: string;
  date: string; // YYYY-MM-DD
  entryType: 'check_in' | 'relapse';
  value: number;
  trigger: string | null;
}
