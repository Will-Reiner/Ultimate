export type HabitType = 'build' | 'quit';
export type FrequencyType = 'daily' | 'weekly' | 'specific_days' | 'interval';
export type TrackingMode = 'boolean' | 'quantitative';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type EntryType = 'check_in' | 'relapse';
export type GoalType = 'deadline' | 'ongoing';
export type GoalStatus = 'in_progress' | 'completed' | 'failed';

export interface FrequencyDTO {
  type: FrequencyType;
  times_per_week: number | null;
  days: number[];
  every_n_days: number | null;
}

export interface GoalDTO {
  type: GoalType;
  target_value: number;
  target_unit: string;
  deadline: string | null;
  status: GoalStatus;
}

export interface HabitDTO {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: HabitType;
  tracking_mode: TrackingMode;
  daily_target: number | null;
  target_unit: string | null;
  frequency: FrequencyDTO;
  goal: GoalDTO | null;
  category_id: string | null;
  tags: string[];
  reminders: string[];
  status: HabitStatus;
  track_relapse_intensity: boolean;
  track_relapse_trigger: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  type?: HabitType;
  tracking_mode?: TrackingMode;
  daily_target?: number;
  target_unit?: string;
  frequency_type: FrequencyType;
  frequency_times_per_week?: number;
  frequency_days?: number[];
  frequency_every_n_days?: number;
  goal_type?: GoalType;
  goal_target_value?: number;
  goal_target_unit?: string;
  goal_deadline?: string;
  category_id?: string;
  track_relapse_intensity?: boolean;
  track_relapse_trigger?: boolean;
  tag_ids?: string[];
  reminders?: string[];
}

export interface UpdateHabitInput {
  name?: string;
  description?: string | null;
  tracking_mode?: TrackingMode;
  daily_target?: number | null;
  target_unit?: string | null;
  frequency_type?: FrequencyType;
  frequency_times_per_week?: number;
  frequency_days?: number[];
  frequency_every_n_days?: number;
  goal_type?: GoalType;
  goal_target_value?: number;
  goal_target_unit?: string;
  goal_deadline?: string;
  category_id?: string | null;
  track_relapse_intensity?: boolean;
  track_relapse_trigger?: boolean;
  tag_ids?: string[];
  reminders?: string[];
}

export interface HabitEntryDTO {
  id: string;
  habit_id: string;
  date: string;
  entry_type: EntryType;
  value: number;
  note: string | null;
  intensity: number | null;
  trigger: string | null;
  created_at: string;
}

export interface CreateEntryInput {
  date?: string;
  entry_type?: EntryType;
  value?: number;
  note?: string;
  intensity?: number;
  trigger?: string;
}

export interface StreakDTO {
  current_streak: number;
  longest_streak: number;
  credit_days: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface TagDTO {
  id: string;
  name: string;
  color: string;
}

export interface HabitDetailDTO {
  habit: HabitDTO;
  streak: StreakDTO;
  monthEntries: HabitEntryDTO[];
  completedToday: boolean;
}
