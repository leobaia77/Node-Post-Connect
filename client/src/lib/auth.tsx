import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, Profile, TeenProfile } from "@shared/schema";

interface AuthUser {
  user: User;
  profile: Profile | null;
  teenProfile: TeenProfile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, displayName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    await refreshUser();
  };

  const register = async (email: string, password: string, role: string, displayName: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, displayName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }
    const data = await res.json();
    localStorage.setItem("token", data.token);
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
