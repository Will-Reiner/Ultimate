import { HttpClient } from './HttpClient';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = new HttpClient(API_BASE_URL);
