import { Habit } from '../../domain/entities/Habit';
import { HabitEntry } from '../../domain/entities/HabitEntry';

export interface FrequencyResponseDto {
  type: string;
  times_per_week: number | null;
  days: number[];
  every_n_days: number | null;
}

export interface GoalResponseDto {
  type: string;
  target_value: number;
  target_unit: string;
  deadline: string | null;
  status: string;
}

export interface HabitResponseDto {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: string;
  tracking_mode: string;
  daily_target: number | null;
  target_unit: string | null;
  frequency: FrequencyResponseDto;
  goal: GoalResponseDto | null;
  category_id: string | null;
  tags: string[];
  reminders: string[];
  status: string;
  track_relapse_intensity: boolean;
  track_relapse_trigger: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntryResponseDto {
  id: string;
  habit_id: string;
  date: string;
  entry_type: string;
  value: number;
  note: string | null;
  intensity: number | null;
  trigger: string | null;
  created_at: string;
}

export function toHabitResponseDto(habit: Habit): HabitResponseDto {
  const freq = habit.frequency;
  const goal = habit.goal;

  return {
    id: habit.id,
    user_id: habit.userId,
    name: habit.name,
    description: habit.description,
    type: habit.type,
    tracking_mode: habit.trackingMode,
    daily_target: habit.dailyTarget,
    target_unit: habit.targetUnit,
    frequency: {
      type: freq.type,
      times_per_week: freq.timesPerWeek,
      days: freq.days,
      every_n_days: freq.everyNDays,
    },
    goal: goal
      ? {
          type: goal.type,
          target_value: goal.targetValue,
          target_unit: goal.targetUnit,
          deadline: goal.deadline?.toISOString() ?? null,
          status: goal.status,
        }
      : null,
    category_id: habit.categoryId,
    tags: habit.tags,
    reminders: habit.reminders,
    status: habit.status,
    track_relapse_intensity: habit.trackRelapseIntensity,
    track_relapse_trigger: habit.trackRelapseTrigger,
    created_at: habit.createdAt.toISOString(),
    updated_at: habit.updatedAt.toISOString(),
  };
}

export interface StreakResponseDto {
  current_streak: number;
  longest_streak: number;
  credit_days: number;
}

export function toEntryResponseDto(entry: HabitEntry): EntryResponseDto {
  return {
    id: entry.id,
    habit_id: entry.habitId,
    date: entry.date,
    entry_type: entry.entryType,
    value: entry.value,
    note: entry.note,
    intensity: entry.intensity,
    trigger: entry.trigger,
    created_at: entry.createdAt.toISOString(),
  };
}
