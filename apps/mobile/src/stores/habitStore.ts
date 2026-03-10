import { create } from 'zustand';
import {
  HabitDTO,
  HabitDetailDTO,
  CreateHabitInput,
  UpdateHabitInput,
  CreateEntryInput,
  HabitStatus,
} from '../types/habit';
import * as habitService from '../services/habitService';

interface HabitState {
  habits: HabitDTO[];
  selectedDetail: HabitDetailDTO | null;
  isLoading: boolean;
  error: string | null;

  fetchHabits(status?: HabitStatus): Promise<void>;
  createHabit(input: CreateHabitInput): Promise<void>;
  addEntry(habitId: string, input: CreateEntryInput): Promise<void>;
  fetchHabitDetail(habitId: string): Promise<void>;
  updateHabit(habitId: string, input: UpdateHabitInput): Promise<void>;
  pauseHabit(habitId: string): Promise<void>;
  archiveHabit(habitId: string): Promise<void>;
  reactivateHabit(habitId: string): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  selectedDetail: null,
  isLoading: false,
  error: null,

  async fetchHabits(status) {
    set({ isLoading: true, error: null });
    try {
      const habits = await habitService.getHabits(status);
      set({ habits, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar hábitos.';
      set({ isLoading: false, error: message });
    }
  },

  async createHabit(input) {
    set({ isLoading: true, error: null });
    try {
      const habit = await habitService.createHabit(input);
      set({ habits: [...get().habits, habit], isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar hábito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async addEntry(habitId, input) {
    try {
      await habitService.createEntry(habitId, input);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar entrada.';
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
      const message = err instanceof Error ? err.message : 'Erro ao atualizar hábito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async pauseHabit(habitId) {
    try {
      const updated = await habitService.pauseHabit(habitId);
      set({ habits: get().habits.map((h) => (h.id === habitId ? updated : h)) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao pausar hábito.';
      set({ error: message });
      throw err;
    }
  },

  async archiveHabit(habitId) {
    try {
      await habitService.archiveHabit(habitId);
      set({
        habits: get().habits.filter((h) => h.id !== habitId),
        selectedDetail: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao arquivar hábito.';
      set({ error: message });
      throw err;
    }
  },

  async reactivateHabit(habitId) {
    try {
      const updated = await habitService.reactivateHabit(habitId);
      set({ habits: [...get().habits, updated] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao reativar hábito.';
      set({ error: message });
      throw err;
    }
  },

  async deleteHabit(habitId) {
    try {
      await habitService.deleteHabit(habitId);
      set({
        habits: get().habits.filter((h) => h.id !== habitId),
        selectedDetail: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar hábito.';
      set({ error: message });
      throw err;
    }
  },
}));
