import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineManager } from '@/services/offlineManager';

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    setIsOnline(offlineManager.getIsOnline());

    const unsubscribe = offlineManager.addNetworkListener((online) => {
      setIsOnline(online);
    });

    const updatePendingCount = async () => {
      const count = await offlineManager.getPendingSyncCount();
      setPendingSyncCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { isOnline, pendingSyncCount };
}

export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isOnline } = useOfflineStatus();
  const { enabled = true } = options;
  
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (offlineManager.getIsOnline()) {
        const freshData = await fetchFnRef.current();
        setData(freshData);
        setIsFromCache(false);
        await offlineManager.cacheData(key, freshData);
      } else {
        const cachedData = await offlineManager.getCachedData<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        } else {
          setError(new Error('No cached data available'));
        }
      }
    } catch (err) {
      const cachedData = await offlineManager.getCachedData<T>(key);
      if (cachedData) {
        setData(cachedData);
        setIsFromCache(true);
      } else {
        setError(err instanceof Error ? err : new Error('Failed to load data'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, [key, isOnline, enabled, loadData]);

  const refetch = useCallback(() => {
    return loadData();
  }, [loadData]);

  return { data, isLoading, error, isFromCache, refetch };
}
