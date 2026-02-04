import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../lib/types";
import * as authApi from "../lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = authApi.getCurrentUser();
    const t = authApi.getToken();
    setUser(current);
    setToken(t);
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setUser(res.user);
    setToken(res.token);
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    setUser(res.user);
    setToken(res.token);
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

