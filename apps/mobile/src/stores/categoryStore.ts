import { create } from 'zustand';
import { CategoryDTO } from '../types/habit';
import * as categoryService from '../services/categoryService';

interface CategoryState {
  categories: CategoryDTO[];
  isLoading: boolean;
  error: string | null;

  fetchCategories(): Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  async fetchCategories() {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryService.getCategories();
      set({ categories, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar categorias.';
      set({ isLoading: false, error: message });
    }
  },
}));
