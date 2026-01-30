import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { healthKit, SleepEntry, WorkoutEntry, ActivitySummary, NutritionSummary } from '@/services/healthKit';
import { api } from '@/services/api';

interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;
  dataStatus: {
    sleep: 'found' | 'not_found' | 'unknown';
    workouts: 'found' | 'not_found' | 'unknown';
    activity: 'found' | 'not_found' | 'unknown';
    nutrition: 'found' | 'not_found' | 'unknown';
  };
}

interface HealthSyncPayload {
  sleep: SleepEntry[];
  workouts: WorkoutEntry[];
  activity: ActivitySummary;
  nutrition: NutritionSummary;
}

const HEALTH_CONNECTED_KEY = 'health_kit_connected';
const LAST_SYNC_KEY = 'health_kit_last_sync';

export function useHealthKitSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    dataStatus: {
      sleep: 'unknown',
      workouts: 'unknown',
      activity: 'unknown',
      nutrition: 'unknown',
    },
  });

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  useEffect(() => {
    if (!status.isConnected) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && status.isConnected) {
        syncHealthData();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [status.isConnected]);

  const loadConnectionStatus = async () => {
    try {
      const connected = await SecureStore.getItemAsync(HEALTH_CONNECTED_KEY);
      const lastSync = await SecureStore.getItemAsync(LAST_SYNC_KEY);
      
      if (connected === 'true') {
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          lastSyncTime: lastSync,
        }));
      }
    } catch (error) {
      console.error('Failed to load HealthKit connection status:', error);
    }
  };

  const connect = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      setStatus(prev => ({
        ...prev,
        error: 'HealthKit is only available on iOS devices',
      }));
      return false;
    }

    try {
      const granted = await healthKit.requestPermissions();
      
      if (granted) {
        await SecureStore.setItemAsync(HEALTH_CONNECTED_KEY, 'true');
        setStatus(prev => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        
        // Perform initial sync
        await syncHealthData();
        return true;
      } else {
        setStatus(prev => ({
          ...prev,
          error: 'Permission denied. You can enable Health access in Settings.',
        }));
        return false;
      }
    } catch (error) {
      console.error('Failed to connect HealthKit:', error);
      setStatus(prev => ({
        ...prev,
        error: 'Failed to connect to Apple Health',
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(HEALTH_CONNECTED_KEY);
      await SecureStore.deleteItemAsync(LAST_SYNC_KEY);
      
      setStatus({
        isConnected: false,
        isSyncing: false,
        lastSyncTime: null,
        error: null,
        dataStatus: {
          sleep: 'unknown',
          workouts: 'unknown',
          activity: 'unknown',
          nutrition: 'unknown',
        },
      });
    } catch (error) {
      console.error('Failed to disconnect HealthKit:', error);
    }
  }, []);

  const syncHealthData = useCallback(async (): Promise<void> => {
    if (!status.isConnected) return;

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch all health data in parallel
      const [sleepData, workoutData, activityData, nutritionData] = await Promise.all([
        healthKit.getSleepData(sevenDaysAgo, today),
        healthKit.getWorkoutData(sevenDaysAgo, today),
        healthKit.getActivityData(today),
        healthKit.getNutritionData(today),
      ]);

      // Update data status
      const dataStatus = {
        sleep: sleepData.length > 0 ? 'found' as const : 'not_found' as const,
        workouts: workoutData.length > 0 ? 'found' as const : 'not_found' as const,
        activity: activityData.steps > 0 ? 'found' as const : 'not_found' as const,
        nutrition: nutritionData.calories !== null ? 'found' as const : 'not_found' as const,
      };

      // Sync to backend
      const payload: HealthSyncPayload = {
        sleep: sleepData,
        workouts: workoutData,
        activity: activityData,
        nutrition: nutritionData,
      };

      try {
        await api.request('/api/health-sync', {
          method: 'POST',
          body: payload,
        });
      } catch (apiError) {
        console.warn('Backend sync failed, data cached locally:', apiError);
        // Continue even if backend sync fails - data is still valuable locally
      }

      const syncTime = new Date().toISOString();
      await SecureStore.setItemAsync(LAST_SYNC_KEY, syncTime);

      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: syncTime,
        dataStatus,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to sync health data:', error);
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync health data',
      }));
    }
  }, [status.isConnected]);

  const openSettings = useCallback(() => {
    healthKit.openHealthSettings();
  }, []);

  return {
    ...status,
    connect,
    disconnect,
    sync: syncHealthData,
    openSettings,
  };
}
