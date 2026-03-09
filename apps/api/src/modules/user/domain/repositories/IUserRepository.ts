import { User } from '../entities/User';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
