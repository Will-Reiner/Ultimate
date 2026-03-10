import { Tag } from '../entities/Tag';

export const TAG_REPOSITORY = 'TAG_REPOSITORY';

export interface CreateTagData {
  userId: string;
  name: string;
  color: string;
}

export interface ITagRepository {
  findAllByUser(userId: string): Promise<Tag[]>;
  findById(id: string, userId: string): Promise<Tag | null>;
  findByName(userId: string, name: string): Promise<Tag | null>;
  create(data: CreateTagData): Promise<Tag>;
  remove(id: string): Promise<void>;
}
