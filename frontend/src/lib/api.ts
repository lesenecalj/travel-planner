import axios from 'axios';
import { authStore } from './auth-store';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // always send the httpOnly refresh token cookie
});

api.interceptors.request.use((config) => {
  const token = authStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        // Cookie is sent automatically (withCredentials) — no body needed
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        authStore.set(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        authStore.set(null);
        window.__authLogout?.();
      }
    }
    return Promise.reject(error);
  },
);

