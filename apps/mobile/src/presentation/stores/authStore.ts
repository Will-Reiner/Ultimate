import { create } from 'zustand';
import { UserDTO } from '@application/user/dtos/UserDTO';
import { LoginUseCase } from '@application/user/use-cases/LoginUseCase';
import { RegisterUseCase } from '@application/user/use-cases/RegisterUseCase';
import { TokenStorage } from '@infrastructure/storage/TokenStorage';
import { apiClient } from '@infrastructure/http/ApiClient';
import { UserRepositoryImpl } from '@infrastructure/repositories/UserRepositoryImpl';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  hydrate(): Promise<void>;
}

const userRepository = new UserRepositoryImpl(apiClient);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new LoginUseCase(userRepository);
      const result = await useCase.execute({ email, password });
      await TokenStorage.saveAccessToken(result.accessToken);
      await TokenStorage.saveRefreshToken(result.refreshToken);
      apiClient.setAuthToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async register(name, email, password) {
    set({ isLoading: true, error: null });
    try {
      const useCase = new RegisterUseCase(userRepository);
      const result = await useCase.execute({ name, email, password });
      await TokenStorage.saveAccessToken(result.accessToken);
      await TokenStorage.saveRefreshToken(result.refreshToken);
      apiClient.setAuthToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async logout() {
    await TokenStorage.clearTokens();
    apiClient.clearAuthToken();
    set({ user: null, accessToken: null });
  },

  async hydrate() {
    const token = await TokenStorage.getAccessToken();
    if (token) {
      apiClient.setAuthToken(token);
      set({ accessToken: token });
    }
  },
}));
