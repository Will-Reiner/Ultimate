import { Habit } from '../entities/Habit';
import { HabitEntry } from '../entities/HabitEntry';

export const HABIT_REPOSITORY = 'HABIT_REPOSITORY';

export interface CreateHabitData {
  userId: string;
  title: string;
  description?: string;
  emoji?: string;
  type: string;
  frequencyType: string;
  daysOfWeek: number[];
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
}

export interface UpdateHabitData {
  title?: string;
  description?: string;
  emoji?: string;
  type?: string;
  frequencyType?: string;
  daysOfWeek?: number[];
  goalValue?: number;
  goalUnit?: string;
  reminderTime?: string;
  color?: string;
  isArchived?: boolean;
}

export interface IHabitRepository {
  findAll(userId: string): Promise<Habit[]>;
  findOne(id: string, userId: string): Promise<Habit | null>;
  create(data: CreateHabitData): Promise<Habit>;
  update(id: string, data: UpdateHabitData): Promise<Habit>;
  remove(id: string): Promise<void>;
  getEntries(habitId: string, from: Date, to: Date): Promise<HabitEntry[]>;
  findEntryBetween(habitId: string, from: Date, to: Date): Promise<HabitEntry | null>;
  createEntry(habitId: string, completedAt: Date, value: number, note?: string): Promise<HabitEntry>;
}
