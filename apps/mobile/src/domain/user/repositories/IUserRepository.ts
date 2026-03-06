import { User } from '../entities/User';

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  /** Returns auth tokens after validating credentials against the API */
  authenticate(email: string, password: string): Promise<AuthResult>;
  /** Sends registration request and returns the created user + tokens */
  register(name: string, email: string, password: string): Promise<AuthResult>;
}
