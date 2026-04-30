import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AUTH_STORAGE_KEY } from "../constants/storage";
import type { AdminProfile, LoginPayload } from "../types/api";
import { authService } from "../services/authService";

interface AuthState {
  token: string;
  admin: AdminProfile;
}

interface AuthContextValue {
  token: string | null;
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredAuth = (): AuthState | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.token || !parsed.admin) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persist = (nextToken: string, nextAdmin: AdminProfile) => {
    const payload: AuthState = { token: nextToken, admin: nextAdmin };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    setToken(nextToken);
    setAdmin(nextAdmin);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    persist(data.token, data.admin);
  }, []);

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setIsBootstrapping(false);
      return;
    }

    setToken(stored.token);
    setAdmin(stored.admin);

    authService
      .me()
      .then((response) => {
        persist(stored.token, response.admin);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      logout
    }),
    [admin, isBootstrapping, login, logout, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

