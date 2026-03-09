import { api } from './api';
import { AuthResultDTO, UserDTO } from '../types/user';

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

function mapAuthResult(data: ApiAuthResponse): AuthResultDTO {
  return {
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatarUrl: data.user.avatar_url,
      createdAt: data.user.created_at,
    } satisfies UserDTO,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  };
}

export async function login(email: string, password: string): Promise<AuthResultDTO> {
  const data = await api.post<ApiAuthResponse>('/auth/login', { email, password });
  return mapAuthResult(data);
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResultDTO> {
  const data = await api.post<ApiAuthResponse>('/auth/register', { name, email, password });
  return mapAuthResult(data);
}
