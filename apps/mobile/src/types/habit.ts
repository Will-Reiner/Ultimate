export type HabitType = 'build' | 'quit';
export type FrequencyType = 'daily' | 'weekly';

export interface FrequencyProps {
  type: FrequencyType;
  /** For 'weekly': [0=Sun … 6=Sat]. Not required for 'daily'. */
  daysOfWeek?: number[];
}

export interface HabitDTO {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitInput {
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  type: HabitType;
  frequency: FrequencyProps;
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  emoji?: string;
  type?: HabitType;
  frequency?: FrequencyProps;
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
}

export interface HabitEntryDTO {
  id: string;
  habitId: string;
  completedAt: string;
  value: number;
  note?: string;
}

export interface StreakDTO {
  currentStreak: number;
  bestStreak: number;
}

export interface HabitDetailDTO {
  habit: HabitDTO;
  streak: StreakDTO;
  monthEntries: HabitEntryDTO[];
  completedToday: boolean;
}
