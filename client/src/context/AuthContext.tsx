import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "../lib/api.js";

export type ThemeMode = "light" | "dark" | "system";

export interface User {
  _id: string;
  username: string;
  normalizedUsername: string;
  preferences?: {
    theme?: ThemeMode;
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("shrtn_theme") as ThemeMode) || "system";
  });

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
    localStorage.setItem("shrtn_theme", mode);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiRequest<{ user: User }>("/auth/me");
      setUser(res.user);
      if (res.user.preferences?.theme) {
        setThemeState(res.user.preferences.theme);
        applyTheme(res.user.preferences.theme);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiRequest<{ user: User }>("/auth/login", {
      method: "POST",
      body: { username, password },
    });
    setUser(res.user);
    if (res.user.preferences?.theme) {
      setThemeState(res.user.preferences.theme);
      applyTheme(res.user.preferences.theme);
    }
  };

  const register = async (username: string, password: string) => {
    const res = await apiRequest<{ user: User }>("/auth/register", {
      method: "POST",
      body: { username, password },
    });
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Ignore error during logout
    } finally {
      setUser(null);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    if (user) {
      try {
        await apiRequest("/users/me/preferences", {
          method: "PATCH",
          body: { theme: newTheme },
        });
      } catch (err) {
        console.error("Failed to persist theme preference:", err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        setTheme,
        login,
        register,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
