import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { AppError } from '@shared/errors/AppError';

export class HttpClient {
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
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw HttpClient.handleError(error);
    }
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw HttpClient.handleError(error);
    }
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw HttpClient.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw HttpClient.handleError(error);
    }
  }

  private static handleError(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string; code?: string }>;
      const message = axiosError.response?.data?.message ?? axiosError.message;
      const code = axiosError.response?.data?.code ?? 'HTTP_ERROR';
      const statusCode = axiosError.response?.status ?? 500;
      return new AppError(message, code, statusCode);
    }
    return new AppError('Erro inesperado.', 'UNEXPECTED_ERROR', 500);
  }
}
