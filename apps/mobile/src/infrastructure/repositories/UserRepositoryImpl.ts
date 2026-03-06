import { IUserRepository, AuthResult } from '@domain/user/repositories/IUserRepository';
import { User } from '@domain/user/entities/User';
import { HttpClient } from '../http/HttpClient';

interface ApiAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  refresh_token: string;
}

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly http: HttpClient) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      const data = await this.http.get<ApiAuthResponse['user']>(
        `/users?email=${encodeURIComponent(email)}`,
      );
      return this.mapToEntity(data);
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const data = await this.http.get<ApiAuthResponse['user']>(`/users/${id}`);
      return this.mapToEntity(data);
    } catch {
      return null;
    }
  }

  async save(user: User): Promise<void> {
    await this.http.post('/users', user.toJSON());
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    const data = await this.http.post<ApiAuthResponse>('/auth/login', { email, password });
    return this.mapAuthResult(data);
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const data = await this.http.post<ApiAuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return this.mapAuthResult(data);
  }

  private mapToEntity(raw: ApiAuthResponse['user']): User {
    return User.restore({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      avatarUrl: raw.avatar_url,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    });
  }

  private mapAuthResult(data: ApiAuthResponse): AuthResult {
    return {
      user: this.mapToEntity(data.user),
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }
}
