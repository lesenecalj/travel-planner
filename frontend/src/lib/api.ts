import axios from 'axios';
import { authStore } from './auth-store';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // sends the httpOnly refresh token cookie on every request
});

api.interceptors.request.use((config) => {
  const token = authStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Dedicated instance for auth endpoints — no Bearer token, no response interceptor.
// This prevents infinite refresh loops when a /auth/* call returns 401.
export const authApi = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

