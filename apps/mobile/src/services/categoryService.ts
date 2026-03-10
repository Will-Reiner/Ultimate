import { api } from './api';
import { CategoryDTO } from '../types/habit';

export async function getCategories(): Promise<CategoryDTO[]> {
  return api.get<CategoryDTO[]>('/categories');
}
