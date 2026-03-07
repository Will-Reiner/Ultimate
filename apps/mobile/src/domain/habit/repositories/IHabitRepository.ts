import { Habit } from '../entities/Habit';
import { HabitEntry } from '../entities/HabitEntry';
import { ID } from '@shared/types';

export interface IHabitRepository {
  findById(id: ID): Promise<Habit | null>;
  findAllByUserId(userId: ID): Promise<Habit[]>;
  save(habit: Habit): Promise<Habit>;
  update(habit: Habit): Promise<void>;
  delete(id: ID): Promise<void>;

  // Entries
  saveEntry(entry: HabitEntry): Promise<void>;
  findEntriesByHabitId(habitId: ID, from: Date, to: Date): Promise<HabitEntry[]>;
  findEntriesByHabitIdForMonth(habitId: ID, year: number, month: number): Promise<HabitEntry[]>;
  findEntryForToday(habitId: ID): Promise<HabitEntry | null>;
}
