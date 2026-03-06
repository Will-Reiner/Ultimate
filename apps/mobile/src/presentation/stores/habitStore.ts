import { create } from 'zustand';
import { HabitDTO } from '@application/habit/dtos/HabitDTO';
import { CreateHabitUseCase, ListHabitsUseCase } from '@application/habit/use-cases/HabitUseCases';
import { CompleteHabitUseCase } from '@application/habit/use-cases/CompleteHabitUseCase';
import { apiClient } from '@infrastructure/http/ApiClient';
import { HabitRepositoryImpl } from '@infrastructure/repositories/HabitRepositoryImpl';
import { FrequencyProps } from '@domain/habit/value-objects/Frequency';

interface HabitState {
  habits: HabitDTO[];
  isLoading: boolean;
  error: string | null;

  fetchHabits(userId: string): Promise<void>;
  createHabit(params: {
    userId: string;
    title: string;
    description?: string;
    emoji?: string;
    frequency: FrequencyProps;
    color?: string;
  }): Promise<void>;
  completeHabit(habitId: string, note?: string): Promise<void>;
}

const habitRepository = new HabitRepositoryImpl(apiClient);

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  async fetchHabits(userId) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new ListHabitsUseCase(habitRepository);
      const habits = await useCase.execute(userId);
      set({ habits, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar hábitos.';
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
      const message = err instanceof Error ? err.message : 'Erro ao criar hábito.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async completeHabit(habitId, note) {
    try {
      const useCase = new CompleteHabitUseCase(habitRepository);
      await useCase.execute(habitId, note);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao completar hábito.';
      set({ error: message });
      throw err;
    }
  },
}));
