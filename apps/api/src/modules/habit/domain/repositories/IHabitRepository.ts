import { Habit } from '../entities/Habit';
import { HabitEntry } from '../entities/HabitEntry';
import { HabitType, TrackingMode, HabitStatus } from '../entities/Habit';
import { FrequencyType } from '../value-objects/Frequency';
import { GoalType, GoalStatus } from '../value-objects/Goal';

export const HABIT_REPOSITORY = 'HABIT_REPOSITORY';

export interface CreateHabitData {
  userId: string;
  name: string;
  description?: string | null;
  type: HabitType;
  trackingMode: TrackingMode;
  dailyTarget?: number | null;
  targetUnit?: string | null;
  frequencyType: FrequencyType;
  frequencyTimesPerWeek?: number | null;
  frequencyDays?: number[];
  frequencyEveryNDays?: number | null;
  goalType?: GoalType | null;
  goalTargetValue?: number | null;
  goalTargetUnit?: string | null;
  goalDeadline?: Date | null;
  goalStatus?: GoalStatus | null;
  categoryId?: string | null;
  status?: HabitStatus;
  trackRelapseIntensity?: boolean;
  trackRelapseTrigger?: boolean;
  tagIds?: string[];
  reminders?: string[];
}

export interface UpdateHabitData {
  name?: string;
  description?: string | null;
  trackingMode?: TrackingMode;
  dailyTarget?: number | null;
  targetUnit?: string | null;
  frequencyType?: FrequencyType;
  frequencyTimesPerWeek?: number | null;
  frequencyDays?: number[];
  frequencyEveryNDays?: number | null;
  goalType?: GoalType | null;
  goalTargetValue?: number | null;
  goalTargetUnit?: string | null;
  goalDeadline?: Date | null;
  goalStatus?: GoalStatus | null;
  categoryId?: string | null;
  status?: HabitStatus;
  trackRelapseIntensity?: boolean;
  trackRelapseTrigger?: boolean;
  tagIds?: string[];
  reminders?: string[];
}

export interface CreateEntryData {
  habitId: string;
  date: string;
  entryType: string;
  value: number;
  note?: string | null;
  intensity?: number | null;
  trigger?: string | null;
}

export interface IHabitRepository {
  findAll(userId: string, status?: HabitStatus): Promise<Habit[]>;
  findOne(id: string, userId: string): Promise<Habit | null>;
  create(data: CreateHabitData): Promise<Habit>;
  update(id: string, data: UpdateHabitData): Promise<Habit>;
  remove(id: string): Promise<void>;
  getEntries(habitId: string, from: string, to: string, entryType?: string): Promise<HabitEntry[]>;
  findEntryByDate(habitId: string, date: string, entryType?: string): Promise<HabitEntry | null>;
  createEntry(data: CreateEntryData): Promise<HabitEntry>;
}
