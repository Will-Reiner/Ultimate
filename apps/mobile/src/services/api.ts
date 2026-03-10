import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.get<T>(url, config);
      return res.data;
    } catch (e) {
      throw ApiClient.toApiError(e);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.post<T>(url, data, config);
      return res.data;
    } catch (e) {
      throw ApiClient.toApiError(e);
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.put<T>(url, data, config);
      return res.data;
    } catch (e) {
      throw ApiClient.toApiError(e);
    }
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.patch<T>(url, data, config);
      return res.data;
    } catch (e) {
      throw ApiClient.toApiError(e);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.delete<T>(url, config);
      return res.data;
    } catch (e) {
      throw ApiClient.toApiError(e);
    }
  }

  private static toApiError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const e = error as AxiosError<{ message?: string; code?: string }>;
      const message = e.response?.data?.message ?? e.message;
      const code = e.response?.data?.code ?? 'HTTP_ERROR';
      const statusCode = e.response?.status ?? 500;
      return new ApiError(message, code, statusCode);
    }
    return new ApiError('Erro inesperado.', 'UNEXPECTED_ERROR', 500);
  }
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = new ApiClient(API_BASE_URL);
