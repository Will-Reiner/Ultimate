import { api } from './api';
import {
  HabitDTO,
  HabitDetailDTO,
  HabitEntryDTO,
  StreakDTO,
  CreateHabitInput,
  UpdateHabitInput,
  FrequencyType,
} from '../types/habit';

// ─── API response shapes ───────────────────────────────────────────────────

interface ApiHabit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  emoji?: string;
  type: string;
  frequency_type: string;
  days_of_week?: number[];
  goal_value?: number | null;
  goal_unit?: string | null;
  reminder_time?: string | null;
  color?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiEntry {
  id: string;
  habit_id: string;
  completed_at: string;
  value: number;
  note?: string;
}

// ─── Mappers ───────────────────────────────────────────────────────────────

function mapHabit(raw: ApiHabit): HabitDTO {
  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.title,
    description: raw.description,
    emoji: raw.emoji,
    type: raw.type as HabitDTO['type'],
    frequency: {
      type: raw.frequency_type as FrequencyType,
      daysOfWeek: raw.days_of_week,
    },
    goalValue: raw.goal_value ?? undefined,
    goalUnit: raw.goal_unit ?? undefined,
    reminderTime: raw.reminder_time ?? undefined,
    color: raw.color,
    isArchived: raw.is_archived,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapEntry(raw: ApiEntry): HabitEntryDTO {
  return {
    id: raw.id,
    habitId: raw.habit_id,
    completedAt: raw.completed_at,
    value: raw.value,
    note: raw.note,
  };
}

// ─── Streak calculation ────────────────────────────────────────────────────

function isActiveOn(date: Date, frequencyType: FrequencyType, daysOfWeek?: number[]): boolean {
  if (frequencyType === 'daily') return true;
  return daysOfWeek?.includes(date.getDay()) ?? false;
}

function calculateStreak(
  entries: HabitEntryDTO[],
  frequencyType: FrequencyType,
  daysOfWeek?: number[],
): StreakDTO {
  if (entries.length === 0) return { currentStreak: 0, bestStreak: 0 };

  const completedDays = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.completedAt);
    completedDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  let isCurrentStreakOpen = true;

  for (let i = 0; i < 365; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

    if (isActiveOn(cursor, frequencyType, daysOfWeek)) {
      if (completedDays.has(key)) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        if (i === 0 && isCurrentStreakOpen) {
          // today not yet completed — don't break streak
        } else {
          if (isCurrentStreakOpen) {
            currentStreak = streak;
            isCurrentStreakOpen = false;
          }
          streak = 0;
        }
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  if (isCurrentStreakOpen) currentStreak = streak;

  return { currentStreak, bestStreak };
}

// ─── Service functions ─────────────────────────────────────────────────────

export async function getHabits(): Promise<HabitDTO[]> {
  const data = await api.get<ApiHabit[]>('/habits');
  return data.map(mapHabit);
}

export async function getHabit(id: string): Promise<HabitDTO> {
  const data = await api.get<ApiHabit>(`/habits/${id}`);
  return mapHabit(data);
}

export async function createHabit(input: CreateHabitInput): Promise<HabitDTO> {
  const data = await api.post<ApiHabit>('/habits', {
    title: input.title,
    description: input.description,
    emoji: input.emoji,
    type: input.type,
    frequency_type: input.frequency.type,
    days_of_week: input.frequency.daysOfWeek ?? [],
    goal_value: input.goalValue,
    goal_unit: input.goalUnit,
    reminder_time: input.reminderTime,
    color: input.color,
  });
  return mapHabit(data);
}

export async function updateHabit(id: string, input: UpdateHabitInput): Promise<HabitDTO> {
  const data = await api.put<ApiHabit>(`/habits/${id}`, {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.emoji !== undefined && { emoji: input.emoji }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.frequency !== undefined && {
      frequency_type: input.frequency.type,
      days_of_week: input.frequency.daysOfWeek ?? [],
    }),
    ...(input.goalValue !== undefined && { goal_value: input.goalValue }),
    ...(input.goalUnit !== undefined && { goal_unit: input.goalUnit }),
    ...(input.reminderTime !== undefined && { reminder_time: input.reminderTime }),
    ...(input.color !== undefined && { color: input.color }),
  });
  return mapHabit(data);
}

export async function archiveHabit(id: string): Promise<HabitDTO> {
  const data = await api.put<ApiHabit>(`/habits/${id}`, { is_archived: true });
  return mapHabit(data);
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(`/habits/${id}`);
}

export async function completeHabit(
  habitId: string,
  value = 1,
  note?: string,
): Promise<HabitEntryDTO> {
  const data = await api.post<ApiEntry>(`/habits/${habitId}/entries`, { value, note });
  return mapEntry(data);
}

export async function getHabitDetail(habitId: string): Promise<HabitDetailDTO> {
  const habit = await getHabit(habitId);

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const entries = await api
    .get<ApiEntry[]>(`/habits/${habitId}/entries?from=${from}&to=${to}`)
    .then((rows) => rows.map(mapEntry));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const completedToday = entries.some((e) => {
    const d = new Date(e.completedAt);
    return d >= today && d < tomorrow;
  });

  const streak = calculateStreak(entries, habit.frequency.type, habit.frequency.daysOfWeek);

  return { habit, streak, monthEntries: entries, completedToday };
}
