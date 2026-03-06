import { IHabitRepository } from '@domain/habit/repositories/IHabitRepository';
import { Habit } from '@domain/habit/entities/Habit';
import { HabitEntry } from '@domain/habit/entities/HabitEntry';
import { ID } from '@shared/types';
import { HttpClient } from '../http/HttpClient';

interface ApiHabit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  emoji?: string;
  frequency_type: string;
  days_of_week?: number[];
  color?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiEntry {
  id: string;
  habit_id: string;
  completed_at: string;
  note?: string;
}

export class HabitRepositoryImpl implements IHabitRepository {
  constructor(private readonly http: HttpClient) {}

  async findById(id: ID): Promise<Habit | null> {
    try {
      const data = await this.http.get<ApiHabit>(`/habits/${id}`);
      return this.mapToEntity(data);
    } catch {
      return null;
    }
  }

  async findAllByUserId(_userId: ID): Promise<Habit[]> {
    // user_id is derived from the JWT on the server side
    const data = await this.http.get<ApiHabit[]>('/habits');
    return data.map(this.mapToEntity);
  }

  async save(habit: Habit): Promise<Habit> {
    const data = await this.http.post<ApiHabit>('/habits', {
      title: habit.title,
      description: habit.description,
      emoji: habit.emoji,
      frequency_type: habit.frequency.type,
      days_of_week: habit.frequency.daysOfWeek ?? [],
      color: habit.color,
    });
    return this.mapToEntity(data);
  }

  async update(habit: Habit): Promise<void> {
    await this.http.put(`/habits/${habit.id}`, this.mapToApi(habit));
  }

  async delete(id: ID): Promise<void> {
    await this.http.delete(`/habits/${id}`);
  }

  async saveEntry(entry: HabitEntry): Promise<void> {
    await this.http.post(`/habits/${entry.habitId}/entries`, entry.toJSON());
  }

  async findEntriesByHabitId(habitId: ID, from: Date, to: Date): Promise<HabitEntry[]> {
    const data = await this.http.get<ApiEntry[]>(
      `/habits/${habitId}/entries?from=${from.toISOString()}&to=${to.toISOString()}`,
    );
    return data.map(this.mapEntryToEntity);
  }

  async findEntryForToday(habitId: ID): Promise<HabitEntry | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entries = await this.findEntriesByHabitId(habitId, today, tomorrow);
    return entries[0] ?? null;
  }

  private mapToEntity(raw: ApiHabit): Habit {
    return Habit.restore({
      id: raw.id,
      userId: raw.user_id,
      title: raw.title,
      description: raw.description,
      emoji: raw.emoji,
      frequency: {
        type: raw.frequency_type as 'daily' | 'weekly' | 'custom',
        daysOfWeek: raw.days_of_week,
      },
      color: raw.color,
      isArchived: raw.is_archived,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    });
  }

  private mapToApi(habit: Habit) {
    return {
      title: habit.title,
      description: habit.description,
      emoji: habit.emoji,
      frequency_type: habit.frequency.type,
      days_of_week: habit.frequency.daysOfWeek ?? [],
      color: habit.color,
      is_archived: habit.isArchived,
    };
  }

  private mapEntryToEntity(raw: ApiEntry): HabitEntry {
    return HabitEntry.create({
      id: raw.id,
      habitId: raw.habit_id,
      completedAt: new Date(raw.completed_at),
      note: raw.note,
    });
  }
}
