import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const CACHE_PREFIX = 'offline_cache_';
const SYNC_QUEUE_KEY = 'offline_sync_queue';
const CACHE_EXPIRY_DAYS = 7;

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class OfflineManager {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initNetworkListener();
  }

  private async initNetworkListener() {
    await this.checkNetworkStatus();

    this.checkInterval = setInterval(() => {
      this.checkNetworkStatus();
    }, 30000);

    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        this.checkNetworkStatus();
      }
    });
  }

  private async checkNetworkStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.setOnline(response.ok);
    } catch {
      this.setOnline(false);
    }
  }

  private setOnline(online: boolean) {
    const wasOnline = this.isOnline;
    this.isOnline = online;

    if (wasOnline !== this.isOnline) {
      this.notifyListeners();

      if (this.isOnline) {
        this.processSyncQueue();
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  addNetworkListener(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  async cacheData<T>(key: string, data: T): Promise<void> {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);

      if (Date.now() > entry.expiresAt) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  }

  async clearCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key: string) => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  }

  async clearExpiredCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key: string) => key.startsWith(CACHE_PREFIX));
    const now = Date.now();

    for (const key of cacheKeys) {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const entry = JSON.parse(stored);
          if (now > entry.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      } catch {
        await AsyncStorage.removeItem(key);
      }
    }
  }

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queue = await this.getSyncQueue();
    const newItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(newItem);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const stored = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    const queue = await this.getSyncQueue();
    const index = queue.findIndex(item => item.id === id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  }

  async processSyncQueue(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      return { success: 0, failed: 0 };
    }

    const queue = await this.getSyncQueue();
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        const { storage } = await import('./storage');
        const token = await storage.getToken();

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || ''}${item.endpoint}`, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: item.data ? JSON.stringify(item.data) : undefined,
        });

        if (response.ok) {
          await this.removeFromSyncQueue(item.id);
          success++;
        } else {
          const newRetryCount = item.retryCount + 1;
          if (newRetryCount >= 3) {
            await this.removeFromSyncQueue(item.id);
            failed++;
          } else {
            await this.updateSyncQueueItem(item.id, { retryCount: newRetryCount });
          }
        }
      } catch {
        const newRetryCount = item.retryCount + 1;
        if (newRetryCount >= 3) {
          await this.removeFromSyncQueue(item.id);
          failed++;
        } else {
          await this.updateSyncQueueItem(item.id, { retryCount: newRetryCount });
        }
      }
    }

    return { success, failed };
  }

  async getPendingSyncCount(): Promise<number> {
    const queue = await this.getSyncQueue();
    return queue.length;
  }
}

export const offlineManager = new OfflineManager();
