import { create } from 'zustand';
import { TagDTO } from '../types/habit';
import * as tagService from '../services/tagService';

interface TagState {
  tags: TagDTO[];
  isLoading: boolean;
  error: string | null;

  fetchTags(): Promise<void>;
  createTag(name: string, color: string): Promise<void>;
  deleteTag(id: string): Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  isLoading: false,
  error: null,

  async fetchTags() {
    set({ isLoading: true, error: null });
    try {
      const tags = await tagService.getTags();
      set({ tags, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar tags.';
      set({ isLoading: false, error: message });
    }
  },

  async createTag(name, color) {
    set({ isLoading: true, error: null });
    try {
      const tag = await tagService.createTag(name, color);
      set({ tags: [...get().tags, tag], isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar tag.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async deleteTag(id) {
    try {
      await tagService.deleteTag(id);
      set({ tags: get().tags.filter((t) => t.id !== id) });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar tag.';
      set({ error: message });
      throw err;
    }
  },
}));
