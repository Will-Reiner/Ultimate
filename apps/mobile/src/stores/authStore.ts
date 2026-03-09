import { create } from 'zustand';
import { UserDTO } from '../types/user';
import * as authService from '../services/authService';
import { TokenStorage } from '../storage/TokenStorage';
import { api } from '../services/api';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(email, password);
      await TokenStorage.saveAccessToken(result.accessToken);
      await TokenStorage.saveRefreshToken(result.refreshToken);
      api.setAuthToken(result.accessToken);
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
      const result = await authService.register(name, email, password);
      await TokenStorage.saveAccessToken(result.accessToken);
      await TokenStorage.saveRefreshToken(result.refreshToken);
      api.setAuthToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  async logout() {
    await TokenStorage.clearTokens();
    api.clearAuthToken();
    set({ user: null, accessToken: null });
  },

  async hydrate() {
    const token = await TokenStorage.getAccessToken();
    if (token) {
      api.setAuthToken(token);
      set({ accessToken: token });
    }
  },
}));
