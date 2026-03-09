import { create } from 'zustand';
import { HabitDTO, HabitDetailDTO, CreateHabitInput, UpdateHabitInput } from '../types/habit';
import * as habitService from '../services/habitService';

interface HabitState {
  habits: HabitDTO[];
  selectedDetail: HabitDetailDTO | null;
  isLoading: boolean;
  error: string | null;

  fetchHabits(): Promise<void>;
  createHabit(input: CreateHabitInput): Promise<void>;
  completeHabit(habitId: string, value?: number, note?: string): Promise<void>;
  fetchHabitDetail(habitId: string): Promise<void>;
  updateHabit(habitId: string, input: UpdateHabitInput): Promise<void>;
  archiveHabit(habitId: string): Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  selectedDetail: null,
  isLoading: false,
  error: null,

  async fetchHabits() {
    set({ isLoading: true, error: null });
    try {
      const habits = await habitService.getHabits();
      set({ habits, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar habitos.';
      set({ isLoading: false, error: message });
    }
  },

  async createHabit(input) {
    set({ isLoading: true, error: null });
    try {
      const habit = await habitService.createHabit(input);
      set({ habits: [...get().habits, habit], isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar habito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async completeHabit(habitId, value, note) {
    try {
      await habitService.completeHabit(habitId, value, note);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao completar habito.';
      set({ error: message });
      throw err;
    }
  },

  async fetchHabitDetail(habitId) {
    set({ isLoading: true, error: null });
    try {
      const detail = await habitService.getHabitDetail(habitId);
      set({ selectedDetail: detail, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar detalhes.';
      set({ isLoading: false, error: message });
    }
  },

  async updateHabit(habitId, input) {
    set({ isLoading: true, error: null });
    try {
      const updated = await habitService.updateHabit(habitId, input);
      set({
        habits: get().habits.map((h) => (h.id === habitId ? updated : h)),
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar habito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async archiveHabit(habitId) {
    set({ isLoading: true, error: null });
    try {
      await habitService.archiveHabit(habitId);
      set({
        habits: get().habits.filter((h) => h.id !== habitId),
        selectedDetail: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao arquivar habito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
