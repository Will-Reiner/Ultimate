import { api } from './api';
import { TagDTO } from '../types/habit';

export async function getTags(): Promise<TagDTO[]> {
  return api.get<TagDTO[]>('/tags');
}

export async function createTag(name: string, color: string): Promise<TagDTO> {
  return api.post<TagDTO>('/tags', { name, color });
}

export async function deleteTag(id: string): Promise<void> {
  await api.delete(`/tags/${id}`);
}
