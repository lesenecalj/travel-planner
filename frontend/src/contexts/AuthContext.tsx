import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { Spin } from 'antd';
import { api } from '../lib/api';
import { authStore } from '../lib/auth-store';
import { refresh, logout as apiLogout } from '../lib/authApi';

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const login = useCallback((accessToken: string) => {
    authStore.set(accessToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authStore.set(null);
    setIsAuthenticated(false);
    apiLogout().catch(() => {});
  }, []);

  // On every page load, try to get a fresh access token using the httpOnly cookie.
  useEffect(() => {
    refresh()
      .then((accessToken) => {
        authStore.set(accessToken);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // No valid cookie — user must log in
        authStore.set(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsRestoring(false));
  }, []);

  // Register the 401 response interceptor here so it has direct closure access
  // to `logout` — no global bridge needed. Ejected on unmount.
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const accessToken = await refresh();
            authStore.set(accessToken);
            original.headers.Authorization = `Bearer ${accessToken}`;
            return api(original);
          } catch {
            authStore.set(null);
            logout();
          }
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {isRestoring ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
