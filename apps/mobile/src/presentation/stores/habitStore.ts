import { create } from 'zustand';
import { HabitDTO, HabitDetailDTO, UpdateHabitInput } from '@application/habit/dtos/HabitDTO';
import { CreateHabitUseCase, ListHabitsUseCase } from '@application/habit/use-cases/HabitUseCases';
import { CompleteHabitUseCase } from '@application/habit/use-cases/CompleteHabitUseCase';
import { GetHabitDetailUseCase } from '@application/habit/use-cases/GetHabitDetailUseCase';
import { UpdateHabitUseCase } from '@application/habit/use-cases/UpdateHabitUseCase';
import { ArchiveHabitUseCase } from '@application/habit/use-cases/ArchiveHabitUseCase';
import { apiClient } from '@infrastructure/http/ApiClient';
import { HabitRepositoryImpl } from '@infrastructure/repositories/HabitRepositoryImpl';
import { FrequencyProps } from '@domain/habit/value-objects/Frequency';
import { HabitType } from '@domain/habit/entities/Habit';

interface HabitState {
  habits: HabitDTO[];
  selectedDetail: HabitDetailDTO | null;
  isLoading: boolean;
  error: string | null;

  fetchHabits(userId: string): Promise<void>;
  createHabit(params: {
    userId: string;
    title: string;
    description?: string;
    emoji?: string;
    type: HabitType;
    frequency: FrequencyProps;
    goalValue?: number;
    goalUnit?: string;
    reminderTime?: string;
    color?: string;
  }): Promise<void>;
  completeHabit(habitId: string, value?: number, note?: string): Promise<void>;
  fetchHabitDetail(habitId: string): Promise<void>;
  updateHabit(habitId: string, input: UpdateHabitInput): Promise<void>;
  archiveHabit(habitId: string): Promise<void>;
}

const habitRepository = new HabitRepositoryImpl(apiClient);

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  selectedDetail: null,
  isLoading: false,
  error: null,

  async fetchHabits(userId) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new ListHabitsUseCase(habitRepository);
      const habits = await useCase.execute(userId);
      set({ habits, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar habitos.';
      set({ isLoading: false, error: message });
    }
  },

  async createHabit(params) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new CreateHabitUseCase(habitRepository);
      const habit = await useCase.execute(params);
      set({ habits: [...get().habits, habit], isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar habito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async completeHabit(habitId, value, note) {
    try {
      const useCase = new CompleteHabitUseCase(habitRepository);
      await useCase.execute(habitId, value, note);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao completar habito.';
      set({ error: message });
      throw err;
    }
  },

  async fetchHabitDetail(habitId) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new GetHabitDetailUseCase(habitRepository);
      const detail = await useCase.execute(habitId);
      set({ selectedDetail: detail, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar detalhes.';
      set({ isLoading: false, error: message });
    }
  },

  async updateHabit(habitId, input) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new UpdateHabitUseCase(habitRepository);
      const updated = await useCase.execute(habitId, input);
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
      const useCase = new ArchiveHabitUseCase(habitRepository);
      await useCase.execute(habitId);
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
