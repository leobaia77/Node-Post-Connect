/**
 * Apple HealthKit Integration Service
 * 
 * CRITICAL APPLE COMPLIANCE NOTES:
 * - Never use HealthKit data for advertising or marketing
 * - Never share HealthKit data with third parties for marketing
 * - Store only on device or in encrypted backend, never in iCloud
 * - Provide clear data deletion mechanism via settings
 * - Read-only access: we do not write any data to HealthKit
 */

import { Platform } from 'react-native';

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalHours: number;
  source: 'apple_health';
}

export interface WorkoutEntry {
  id: string;
  date: string;
  workoutType: string;
  durationMinutes: number;
  energyBurned?: number;
  avgHeartRate?: number;
  source: 'apple_health';
}

export interface ActivitySummary {
  date: string;
  steps: number;
  activeEnergyBurned: number;
  moveMinutes: number;
  source: 'apple_health';
}

export interface NutritionSummary {
  date: string;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  source: 'apple_health';
}

export interface HealthKitStatus {
  isAvailable: boolean;
  isAuthorized: boolean;
  lastSyncTime: string | null;
  dataAvailability: {
    sleep: boolean;
    workouts: boolean;
    activity: boolean;
    nutrition: boolean;
  };
}

const WORKOUT_TYPE_MAP: Record<number, string> = {
  1: 'American Football',
  2: 'Archery',
  3: 'Australian Football',
  4: 'Badminton',
  5: 'Baseball',
  6: 'Basketball',
  7: 'Bowling',
  8: 'Boxing',
  9: 'Climbing',
  10: 'Cricket',
  11: 'Cross Training',
  12: 'Curling',
  13: 'Cycling',
  14: 'Dance',
  15: 'Dance Inspired Training',
  16: 'Elliptical',
  17: 'Equestrian Sports',
  18: 'Fencing',
  19: 'Fishing',
  20: 'Functional Strength Training',
  21: 'Golf',
  22: 'Gymnastics',
  23: 'Handball',
  24: 'Hiking',
  25: 'Hockey',
  26: 'Hunting',
  27: 'Lacrosse',
  28: 'Martial Arts',
  29: 'Mind and Body',
  30: 'Mixed Metabolic Cardio Training',
  31: 'Paddle Sports',
  32: 'Play',
  33: 'Preparation and Recovery',
  34: 'Racquetball',
  35: 'Rowing',
  36: 'Rugby',
  37: 'Running',
  38: 'Sailing',
  39: 'Skating Sports',
  40: 'Snow Sports',
  41: 'Soccer',
  42: 'Softball',
  43: 'Squash',
  44: 'Stair Climbing',
  45: 'Surfing Sports',
  46: 'Swimming',
  47: 'Table Tennis',
  48: 'Tennis',
  49: 'Track and Field',
  50: 'Traditional Strength Training',
  51: 'Volleyball',
  52: 'Walking',
  53: 'Water Fitness',
  54: 'Water Polo',
  55: 'Water Sports',
  56: 'Wrestling',
  57: 'Yoga',
  3000: 'Other',
};

class HealthKitService {
  private isAvailable: boolean = false;
  private isAuthorized: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    if (Platform.OS !== 'ios') {
      this.isAvailable = false;
      return;
    }
    
    // In a real implementation, this would use the native HealthKit module
    // For now, we'll simulate availability check
    this.isAvailable = Platform.OS === 'ios';
  }

  async isHealthKitAvailable(): Promise<boolean> {
    return Platform.OS === 'ios';
  }

  /**
   * Request read-only permissions for all health data types
   * Shows educational prompt before system prompt
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('HealthKit is only available on iOS');
      return false;
    }

    try {
      // In a real implementation, this would use expo-health-connect or react-native-health
      // to request permissions for:
      // - HKCategoryTypeIdentifierSleepAnalysis
      // - HKWorkoutType
      // - HKQuantityTypeIdentifierStepCount
      // - HKQuantityTypeIdentifierActiveEnergyBurned
      // - HKQuantityTypeIdentifierHeartRate
      // - HKQuantityTypeIdentifierDietaryEnergyConsumed
      // - HKQuantityTypeIdentifierDietaryProtein
      // - HKQuantityTypeIdentifierDietaryCarbohydrates
      // - HKQuantityTypeIdentifierDietaryFatTotal

      // Simulated permission request
      this.isAuthorized = true;
      return true;
    } catch (error) {
      console.error('Failed to request HealthKit permissions:', error);
      return false;
    }
  }

  /**
   * Get sleep data for a date range
   * Parses into structured entries with bedtime, wake time, total hours
   */
  async getSleepData(startDate: Date, endDate: Date): Promise<SleepEntry[]> {
    if (!this.isAvailable || !this.isAuthorized) {
      return [];
    }

    try {
      // In a real implementation, this would query HKCategoryTypeIdentifierSleepAnalysis
      // and parse "in bed" vs "asleep" categories
      
      // Simulated data for development
      const entries: SleepEntry[] = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        const bedtimeHour = 21 + Math.random() * 2; // 9-11pm
        const sleepHours = 6 + Math.random() * 3; // 6-9 hours
        
        entries.push({
          id: `sleep_${dateStr}`,
          date: dateStr,
          bedtime: `${Math.floor(bedtimeHour)}:${Math.floor((bedtimeHour % 1) * 60).toString().padStart(2, '0')}`,
          wakeTime: `${Math.floor(bedtimeHour + sleepHours) % 24}:${Math.floor(((bedtimeHour + sleepHours) % 1) * 60).toString().padStart(2, '0')}`,
          totalHours: parseFloat(sleepHours.toFixed(1)),
          source: 'apple_health',
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      return entries;
    } catch (error) {
      console.error('Failed to get sleep data:', error);
      return [];
    }
  }

  /**
   * Get workout data for a date range
   * Maps HKWorkoutActivityType to our workout_type enum
   */
  async getWorkoutData(startDate: Date, endDate: Date): Promise<WorkoutEntry[]> {
    if (!this.isAvailable || !this.isAuthorized) {
      return [];
    }

    try {
      // In a real implementation, this would query HKWorkoutType samples
      
      // Simulated data for development
      const entries: WorkoutEntry[] = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        // Random chance of workout on each day
        if (Math.random() > 0.4) {
          const dateStr = current.toISOString().split('T')[0];
          const workoutTypeId = [37, 41, 6, 13, 46, 20][Math.floor(Math.random() * 6)]; // Running, Soccer, Basketball, Cycling, Swimming, Functional
          
          entries.push({
            id: `workout_${dateStr}_${Math.random().toString(36).substr(2, 9)}`,
            date: dateStr,
            workoutType: WORKOUT_TYPE_MAP[workoutTypeId] || 'Other',
            durationMinutes: Math.floor(30 + Math.random() * 90),
            energyBurned: Math.floor(200 + Math.random() * 400),
            avgHeartRate: Math.floor(120 + Math.random() * 40),
            source: 'apple_health',
          });
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      return entries;
    } catch (error) {
      console.error('Failed to get workout data:', error);
      return [];
    }
  }

  /**
   * Get steps and activity summary for a specific date
   */
  async getActivityData(date: Date): Promise<ActivitySummary> {
    if (!this.isAvailable || !this.isAuthorized) {
      return {
        date: date.toISOString().split('T')[0],
        steps: 0,
        activeEnergyBurned: 0,
        moveMinutes: 0,
        source: 'apple_health',
      };
    }

    try {
      // In a real implementation, this would query:
      // - HKQuantityTypeIdentifierStepCount
      // - HKQuantityTypeIdentifierActiveEnergyBurned
      // - HKQuantityTypeIdentifierAppleExerciseTime
      
      // Simulated data
      return {
        date: date.toISOString().split('T')[0],
        steps: Math.floor(5000 + Math.random() * 10000),
        activeEnergyBurned: Math.floor(200 + Math.random() * 500),
        moveMinutes: Math.floor(20 + Math.random() * 60),
        source: 'apple_health',
      };
    } catch (error) {
      console.error('Failed to get activity data:', error);
      return {
        date: date.toISOString().split('T')[0],
        steps: 0,
        activeEnergyBurned: 0,
        moveMinutes: 0,
        source: 'apple_health',
      };
    }
  }

  /**
   * Get nutrition data for a specific date
   * Note: May be incomplete if user doesn't use a food logger that syncs to Health
   */
  async getNutritionData(date: Date): Promise<NutritionSummary> {
    if (!this.isAvailable || !this.isAuthorized) {
      return {
        date: date.toISOString().split('T')[0],
        calories: null,
        protein: null,
        carbohydrates: null,
        fat: null,
        source: 'apple_health',
      };
    }

    try {
      // In a real implementation, this would query:
      // - HKQuantityTypeIdentifierDietaryEnergyConsumed
      // - HKQuantityTypeIdentifierDietaryProtein
      // - HKQuantityTypeIdentifierDietaryCarbohydrates
      // - HKQuantityTypeIdentifierDietaryFatTotal
      
      // Many users won't have nutrition data synced
      const hasNutritionData = Math.random() > 0.6;
      
      if (!hasNutritionData) {
        return {
          date: date.toISOString().split('T')[0],
          calories: null,
          protein: null,
          carbohydrates: null,
          fat: null,
          source: 'apple_health',
        };
      }
      
      return {
        date: date.toISOString().split('T')[0],
        calories: Math.floor(1800 + Math.random() * 800),
        protein: Math.floor(60 + Math.random() * 80),
        carbohydrates: Math.floor(200 + Math.random() * 150),
        fat: Math.floor(50 + Math.random() * 50),
        source: 'apple_health',
      };
    } catch (error) {
      console.error('Failed to get nutrition data:', error);
      return {
        date: date.toISOString().split('T')[0],
        calories: null,
        protein: null,
        carbohydrates: null,
        fat: null,
        source: 'apple_health',
      };
    }
  }

  /**
   * Get current HealthKit connection status
   */
  async getStatus(): Promise<HealthKitStatus> {
    const isAvailable = await this.isHealthKitAvailable();
    
    // In a real implementation, check actual authorization status
    // and probe for data availability
    
    return {
      isAvailable,
      isAuthorized: this.isAuthorized,
      lastSyncTime: null,
      dataAvailability: {
        sleep: this.isAuthorized,
        workouts: this.isAuthorized,
        activity: this.isAuthorized,
        nutrition: false, // Often not available
      },
    };
  }

  /**
   * Open iOS Settings app to HealthKit permissions
   */
  async openHealthSettings(): Promise<void> {
    if (Platform.OS !== 'ios') {
      console.log('Health settings only available on iOS');
      return;
    }
    
    // Import Linking dynamically to open settings
    const { Linking } = require('react-native');
    
    try {
      // Try to open the Health app settings directly
      const healthUrl = 'App-Prefs:root=HEALTH';
      const canOpen = await Linking.canOpenURL(healthUrl);
      
      if (canOpen) {
        await Linking.openURL(healthUrl);
      } else {
        // Fallback to general settings
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open health settings:', error);
      // Last resort: open general settings
      const { Linking } = require('react-native');
      await Linking.openSettings();
    }
  }

  /**
   * Check if currently authorized (for development, this returns the local state)
   * In production, this would query the actual HealthKit authorization status
   */
  getAuthorizationStatus(): boolean {
    return this.isAuthorized;
  }

  /**
   * Clear local authorization state (for disconnect)
   */
  clearAuthorization(): void {
    this.isAuthorized = false;
  }
}

/**
 * NOTE: This service uses simulated data for development purposes.
 * 
 * For production deployment, this service must be updated to use:
 * - expo-health-connect or react-native-health native modules
 * - Actual HealthKit API calls for permission requests
 * - Real data queries from HealthKit
 * 
 * The simulated data allows UI development and testing without
 * requiring a native iOS build with HealthKit entitlements.
 */

export const healthKit = new HealthKitService();
