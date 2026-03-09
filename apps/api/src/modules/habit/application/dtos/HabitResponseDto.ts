import { Habit } from '../../domain/entities/Habit';
import { HabitEntry } from '../../domain/entities/HabitEntry';

export interface HabitResponseDto {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  emoji: string | null;
  type: string;
  frequency_type: string;
  days_of_week: number[];
  goal_value: number | null;
  goal_unit: string | null;
  reminder_time: string | null;
  color: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface EntryResponseDto {
  id: string;
  habit_id: string;
  completed_at: string;
  value: number;
  note: string | null;
}

export function toHabitResponseDto(habit: Habit): HabitResponseDto {
  return {
    id: habit.id,
    user_id: habit.userId,
    title: habit.title,
    description: habit.description,
    emoji: habit.emoji,
    type: habit.type,
    frequency_type: habit.frequencyType,
    days_of_week: habit.daysOfWeek,
    goal_value: habit.goalValue,
    goal_unit: habit.goalUnit,
    reminder_time: habit.reminderTime,
    color: habit.color,
    is_archived: habit.isArchived,
    created_at: habit.createdAt.toISOString(),
    updated_at: habit.updatedAt.toISOString(),
  };
}

export function toEntryResponseDto(entry: HabitEntry): EntryResponseDto {
  return {
    id: entry.id,
    habit_id: entry.habitId,
    completed_at: entry.completedAt.toISOString(),
    value: entry.value,
    note: entry.note,
  };
}
