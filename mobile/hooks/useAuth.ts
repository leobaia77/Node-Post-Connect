import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { api } from '@/services/api';
import { storage } from '@/services/storage';
import type { User, AuthResponse } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await storage.getToken();
      
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await api.getCurrentUser() as { user: User };
      setUser(userData.user);
    } catch (err) {
      setUser(null);
      await storage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const response: AuthResponse = await api.login(email, password);
      setUser(response.user);
      redirectAfterAuth(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: 'user' | 'admin' = 'user'
  ): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const response: AuthResponse = await api.register(email, password, displayName, role);
      setUser(response.user);
      redirectAfterAuth(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
      setUser(null);
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const redirectAfterAuth = (authUser: User) => {
    if (!authUser.onboardingComplete) {
      router.replace('/(onboarding)/age-range');
    } else {
      router.replace('/(tabs)');
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };
}
