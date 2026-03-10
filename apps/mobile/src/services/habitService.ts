import { api } from './api';
import {
  HabitDTO,
  HabitDetailDTO,
  HabitEntryDTO,
  StreakDTO,
  CreateHabitInput,
  UpdateHabitInput,
  CreateEntryInput,
  HabitStatus,
} from '../types/habit';

// ─── Service functions ─────────────────────────────────────────────────────

export async function getHabits(status?: HabitStatus): Promise<HabitDTO[]> {
  const query = status ? `?status=${status}` : '';
  return api.get<HabitDTO[]>(`/habits${query}`);
}

export async function getHabit(id: string): Promise<HabitDTO> {
  return api.get<HabitDTO>(`/habits/${id}`);
}

export async function createHabit(input: CreateHabitInput): Promise<HabitDTO> {
  return api.post<HabitDTO>('/habits', input);
}

export async function updateHabit(id: string, input: UpdateHabitInput): Promise<HabitDTO> {
  return api.put<HabitDTO>(`/habits/${id}`, input);
}

export async function deleteHabit(id: string): Promise<void> {
  await api.delete(`/habits/${id}`);
}

export async function pauseHabit(id: string): Promise<HabitDTO> {
  return api.patch<HabitDTO>(`/habits/${id}/pause`);
}

export async function archiveHabit(id: string): Promise<HabitDTO> {
  return api.patch<HabitDTO>(`/habits/${id}/archive`);
}

export async function reactivateHabit(id: string): Promise<HabitDTO> {
  return api.patch<HabitDTO>(`/habits/${id}/reactivate`);
}

export async function getStreak(habitId: string): Promise<StreakDTO> {
  return api.get<StreakDTO>(`/habits/${habitId}/streak`);
}

export async function getEntries(
  habitId: string,
  from?: string,
  to?: string,
  entryType?: string,
): Promise<HabitEntryDTO[]> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (entryType) params.set('entry_type', entryType);
  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<HabitEntryDTO[]>(`/habits/${habitId}/entries${query}`);
}

export async function createEntry(
  habitId: string,
  input: CreateEntryInput,
): Promise<HabitEntryDTO> {
  return api.post<HabitEntryDTO>(`/habits/${habitId}/entries`, input);
}

export async function evaluateGoal(habitId: string): Promise<HabitDTO> {
  return api.patch<HabitDTO>(`/habits/${habitId}/goal/evaluate`);
}

export async function getHabitDetail(habitId: string): Promise<HabitDetailDTO> {
  const [habit, streak] = await Promise.all([
    getHabit(habitId),
    getStreak(habitId),
  ]);

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const to = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;

  const monthEntries = await getEntries(habitId, from, to);

  const todayStr = now.toISOString().slice(0, 10);
  const completedToday = monthEntries.some(
    (e) => e.date === todayStr && e.entry_type === 'check_in',
  );

  return { habit, streak, monthEntries, completedToday };
}
