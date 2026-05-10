import { authApi } from './api';
import type { AuthTokens } from '../types';

// POST /auth/login
export const login = async (email: string, password: string): Promise<AuthTokens> => {
  const { data } = await authApi.post<AuthTokens>('/login', { email, password });
  return data;
};

// POST /auth/refresh — returns only the new access token
export const refresh = async (): Promise<string> => {
  const { data } = await authApi.post<AuthTokens>('/refresh');
  return data.accessToken;
};

// POST /auth/logout
export const logout = async (): Promise<void> => {
  await authApi.post('/logout');
};
