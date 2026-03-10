import { Tag } from '../../domain/entities/Tag';

export interface TagResponseDto {
  id: string;
  name: string;
  color: string;
}

export function toTagResponseDto(tag: Tag): TagResponseDto {
  return {
    id: tag.id!,
    name: tag.name,
    color: tag.color,
  };
}
