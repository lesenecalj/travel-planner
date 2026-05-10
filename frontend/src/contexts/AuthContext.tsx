import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { api } from '../lib/api';
import { authStore } from '../lib/auth-store';

type AuthContextValue = {
  isAuthenticated: boolean;
  isRestoring: boolean; // true while the silent refresh is in flight on page load
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
    api.post('/auth/logout').catch(() => {});
  }, []);

  // On every page load, try to get a fresh access token using the httpOnly cookie.
  // If the cookie is missing or expired the request will 401 and the user goes to /login.
  useEffect(() => {
    axios
      .post<{ accessToken: string }>('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        authStore.set(data.accessToken);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // No valid cookie — user must log in
        authStore.set(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsRestoring(false));
  }, []);

  useEffect(() => {
    window.__authLogout = logout;
    return () => { delete window.__authLogout; };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isRestoring, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
