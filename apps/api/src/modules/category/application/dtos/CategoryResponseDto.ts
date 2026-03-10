import { Category } from '../../domain/entities/Category';

export interface CategoryResponseDto {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function toCategoryResponseDto(cat: Category): CategoryResponseDto {
  return {
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
  };
}
