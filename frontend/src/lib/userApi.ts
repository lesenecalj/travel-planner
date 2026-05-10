import { api } from './api';
import type { AuthTokens } from '../types';

// POST /users — public registration endpoint
export const register = async (name: string, email: string, password: string): Promise<AuthTokens> => {
  const { data } = await api.post<AuthTokens>('/users', { name, email, password });
  return data;
};
