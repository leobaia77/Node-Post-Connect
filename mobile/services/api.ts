import { storage } from './storage';
import type { AuthResponse, ApiError } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(requiresAuth: boolean): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = await storage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, requiresAuth = true } = options;
    
    const headers = await this.getHeaders(requiresAuth);
    
    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (response.status === 401) {
      await storage.clear();
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ 
        error: 'Request failed' 
      }));
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false,
    });
    
    await storage.setToken(response.token);
    await storage.setUser(response.user);
    
    return response;
  }

  async register(email: string, password: string, displayName: string, role: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName, role },
      requiresAuth: false,
    });
    
    await storage.setToken(response.token);
    await storage.setUser(response.user);
    
    return response;
  }

  async logout(): Promise<void> {
    await storage.clear();
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async getTeenProfile() {
    return this.request('/api/teen/profile');
  }

  async updateTeenProfile(data: unknown) {
    return this.request('/api/teen/profile', { method: 'PATCH', body: data });
  }

  async updateTeenGoals(goals: unknown) {
    return this.request('/api/teen/goals', { method: 'POST', body: { goals } });
  }

  async getParentProfile() {
    return this.request('/api/parent/profile');
  }

  async generateInviteCode() {
    return this.request('/api/parent/invite-code', { method: 'POST' });
  }

  async acceptInviteCode(code: string) {
    return this.request('/api/teen/link-parent', { method: 'POST', body: { inviteCode: code } });
  }

  async updateGuardrails(data: unknown) {
    return this.request('/api/parent/guardrails', { method: 'POST', body: data });
  }

  async createCheckin(data: unknown) {
    return this.request('/api/checkin', { method: 'POST', body: data });
  }

  async logSleep(data: unknown) {
    return this.request('/api/sleep', { method: 'POST', body: data });
  }

  async logWorkout(data: unknown) {
    return this.request('/api/workout', { method: 'POST', body: data });
  }

  async logNutrition(data: unknown) {
    return this.request('/api/nutrition', { method: 'POST', body: data });
  }
}

export const api = new ApiService(API_URL);
