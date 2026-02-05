/**
 * Safety Checker Service
 * 
 * Runs rule-based safety checks on teen health data.
 * This operates WITHOUT an LLM - pure logic-based detection.
 * 
 * IMPORTANT SAFETY NOTES:
 * - Never use shame-based language
 * - Always frame as supportive, not punitive
 * - Include "consult a professional" messaging for health concerns
 * - The app provides guidance, not medical diagnosis
 * - Respect teen privacy for certain alerts (stress, mood)
 */

import { db } from '../db';
import { 
  safetyAlerts, 
  dailyCheckins, 
  sleepLogs, 
  workoutLogs, 
  nutritionLogs,
  teenProfiles,
  profiles,
  type SafetyAlert
} from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { getRule, getRuleSeverity, type AlertType } from './safetyRules';

interface SafetyCheckResult {
  alertType: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  shareWithParent: boolean;
  resourceLink?: string;
}

const HOURS_24 = 24 * 60 * 60 * 1000;

async function checkRecentAlert(
  teenProfileId: string, 
  alertType: AlertType
): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - HOURS_24);
  
  const existing = await db
    .select()
    .from(safetyAlerts)
    .where(
      and(
        eq(safetyAlerts.teenProfileId, teenProfileId),
        eq(safetyAlerts.alertType, alertType),
        gte(safetyAlerts.createdAt, oneDayAgo)
      )
    )
    .limit(1);
  
  return existing.length > 0;
}

async function getMinSleepTarget(teenProfileId: string): Promise<number> {
  // Default minimum sleep target (previously from parent guardrails, now a fixed default)
  return 8.0;
}

async function checkSleepDeficit(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const minTarget = await getMinSleepTarget(teenProfileId);
  const threeDaysAgo = new Date(checkDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentSleep = await db
    .select({ totalHours: sleepLogs.totalHours, date: sleepLogs.date })
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.teenProfileId, teenProfileId),
        gte(sleepLogs.date, threeDaysAgo.toISOString().split('T')[0])
      )
    )
    .orderBy(desc(sleepLogs.date))
    .limit(3);
  
  if (recentSleep.length < 3) return null;
  
  const allBelowTarget = recentSleep.every(
    log => log.totalHours && parseFloat(log.totalHours) < minTarget
  );
  
  if (!allBelowTarget) return null;
  
  const avgHours = recentSleep.reduce(
    (sum, log) => sum + (log.totalHours ? parseFloat(log.totalHours) : 0), 0
  ) / recentSleep.length;
  
  const rule = getRule('sleep_deficit');
  if (!rule) return null;
  
  return {
    alertType: 'sleep_deficit',
    severity: rule.severity,
    message: rule.getMessage({ 
      nights: 3, 
      avgHours: avgHours.toFixed(1), 
      targetHours: minTarget 
    }),
    shareWithParent: rule.shareWithParent,
  };
}

async function checkTrainingSpike(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const oneWeekAgo = new Date(checkDate);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const fourWeeksAgo = new Date(checkDate);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const thisWeekResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${workoutLogs.durationMinutes}), 0)` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, oneWeekAgo.toISOString().split('T')[0])
      )
    );
  
  const previousWeeksResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${workoutLogs.durationMinutes}), 0)` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, fourWeeksAgo.toISOString().split('T')[0]),
        sql`${workoutLogs.date} < ${oneWeekAgo.toISOString().split('T')[0]}`
      )
    );
  
  const thisWeekMinutes = Number(thisWeekResult[0]?.total || 0);
  const prevWeeksMinutes = Number(previousWeeksResult[0]?.total || 0);
  const avgPreviousWeekly = prevWeeksMinutes / 3;
  
  if (avgPreviousWeekly === 0) return null;
  
  const percentIncrease = Math.round((thisWeekMinutes / avgPreviousWeekly) * 100);
  
  if (percentIncrease < 150) return null;
  
  const rule = getRule('training_spike');
  if (!rule) return null;
  
  return {
    alertType: 'training_spike',
    severity: rule.severity,
    message: rule.getMessage({ percentIncrease }),
    shareWithParent: rule.shareWithParent,
  };
}

async function checkPainFlags(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const sevenDaysAgo = new Date(checkDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const painCheckins = await db
    .select()
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.teenProfileId, teenProfileId),
        eq(dailyCheckins.hasPainFlag, true),
        gte(dailyCheckins.date, sevenDaysAgo.toISOString().split('T')[0])
      )
    );
  
  if (painCheckins.length === 0) return null;
  
  const rule = getRule('pain_flag');
  if (!rule) return null;
  
  const severity = getRuleSeverity('pain_flag', { count: painCheckins.length });
  
  return {
    alertType: 'pain_flag',
    severity,
    message: rule.getMessage({ count: painCheckins.length, days: 7 }),
    shareWithParent: painCheckins.length >= 3,
  };
}

async function checkLowEnergy(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const threeDaysAgo = new Date(checkDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentCheckins = await db
    .select({ energyLevel: dailyCheckins.energyLevel })
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.teenProfileId, teenProfileId),
        gte(dailyCheckins.date, threeDaysAgo.toISOString().split('T')[0])
      )
    )
    .orderBy(desc(dailyCheckins.date))
    .limit(3);
  
  if (recentCheckins.length < 3) return null;
  
  const allLowEnergy = recentCheckins.every(c => c.energyLevel <= 2);
  
  if (!allLowEnergy) return null;
  
  const rule = getRule('low_energy');
  if (!rule) return null;
  
  return {
    alertType: 'low_energy',
    severity: rule.severity,
    message: rule.getMessage({ days: 3 }),
    shareWithParent: rule.shareWithParent,
  };
}

async function checkHighStress(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const sevenDaysAgo = new Date(checkDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentCheckins = await db
    .select({ stressLevel: dailyCheckins.stressLevel })
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.teenProfileId, teenProfileId),
        gte(dailyCheckins.date, sevenDaysAgo.toISOString().split('T')[0])
      )
    );
  
  const highStressDays = recentCheckins.filter(c => c.stressLevel >= 4).length;
  
  if (highStressDays < 5) return null;
  
  const rule = getRule('high_stress');
  if (!rule) return null;
  
  return {
    alertType: 'high_stress',
    severity: rule.severity,
    message: rule.getMessage({ days: highStressDays }),
    shareWithParent: false,
  };
}

async function checkRestrictiveEating(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const sevenDaysAgo = new Date(checkDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const caloriesByDay = await db
    .select({ 
      date: nutritionLogs.date,
      totalCalories: sql<number>`COALESCE(SUM(${nutritionLogs.calories}), 0)` 
    })
    .from(nutritionLogs)
    .where(
      and(
        eq(nutritionLogs.teenProfileId, teenProfileId),
        gte(nutritionLogs.date, sevenDaysAgo.toISOString().split('T')[0])
      )
    )
    .groupBy(nutritionLogs.date);
  
  const lowCalorieDays = caloriesByDay.filter(
    day => day.totalCalories > 0 && day.totalCalories < 1200
  ).length;
  
  if (lowCalorieDays < 3) return null;
  
  const trainingResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${workoutLogs.durationMinutes}), 0)` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, sevenDaysAgo.toISOString().split('T')[0])
      )
    );
  
  const weeklyTrainingMinutes = Number(trainingResult[0]?.total || 0);
  
  if (weeklyTrainingMinutes < 180) return null;
  
  // Check if teen has weight loss goal - REQUIRED for this alert
  const teenProfileResult = await db
    .select({ goals: teenProfiles.goals, goalWeights: teenProfiles.goalWeights })
    .from(teenProfiles)
    .where(eq(teenProfiles.id, teenProfileId))
    .limit(1);
  
  const teenProfileData = teenProfileResult[0];
  const hasWeightLossGoal = teenProfileData?.goals?.some(
    (g: string) => g.toLowerCase().includes('weight') || g.toLowerCase().includes('lose')
  ) || false;
  
  // Restrictive eating alert requires weight loss goal as per specification
  if (!hasWeightLossGoal) return null;
  
  const rule = getRule('restrictive_eating');
  if (!rule) return null;
  
  return {
    alertType: 'restrictive_eating',
    severity: 'critical',
    message: rule.getMessage({}),
    shareWithParent: true,
    resourceLink: rule.resourceLink,
  };
}

async function checkOvertraining(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const threeDaysAgo = new Date(checkDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentCheckins = await db
    .select({ 
      energyLevel: dailyCheckins.energyLevel,
      sorenessLevel: dailyCheckins.sorenessLevel 
    })
    .from(dailyCheckins)
    .where(
      and(
        eq(dailyCheckins.teenProfileId, teenProfileId),
        gte(dailyCheckins.date, threeDaysAgo.toISOString().split('T')[0])
      )
    )
    .orderBy(desc(dailyCheckins.date))
    .limit(3);
  
  if (recentCheckins.length < 2) return null;
  
  const avgEnergy = recentCheckins.reduce((sum, c) => sum + c.energyLevel, 0) / recentCheckins.length;
  const avgSoreness = recentCheckins.reduce((sum, c) => sum + c.sorenessLevel, 0) / recentCheckins.length;
  
  if (avgEnergy > 2 || avgSoreness < 4) return null;
  
  const oneWeekAgo = new Date(checkDate);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const fourWeeksAgo = new Date(checkDate);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const thisWeekResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${workoutLogs.durationMinutes}), 0)` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, oneWeekAgo.toISOString().split('T')[0])
      )
    );
  
  const prevWeeksResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${workoutLogs.durationMinutes}), 0)` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, fourWeeksAgo.toISOString().split('T')[0]),
        sql`${workoutLogs.date} < ${oneWeekAgo.toISOString().split('T')[0]}`
      )
    );
  
  const thisWeekMinutes = Number(thisWeekResult[0]?.total || 0);
  const prevWeeksMinutes = Number(prevWeeksResult[0]?.total || 0);
  const avgPreviousWeekly = prevWeeksMinutes / 3;
  
  if (avgPreviousWeekly > 0 && (thisWeekMinutes / avgPreviousWeekly) < 1.3) return null;
  
  const rule = getRule('overtraining');
  if (!rule) return null;
  
  return {
    alertType: 'overtraining',
    severity: rule.severity,
    message: rule.getMessage({}),
    shareWithParent: rule.shareWithParent,
  };
}

async function checkLowIntake(
  teenProfileId: string, 
  checkDate: Date
): Promise<SafetyCheckResult | null> {
  const threeDaysAgo = new Date(checkDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const nutritionData = await db
    .select({ 
      date: nutritionLogs.date,
      totalCalories: sql<number>`COALESCE(SUM(${nutritionLogs.calories}), 0)` 
    })
    .from(nutritionLogs)
    .where(
      and(
        eq(nutritionLogs.teenProfileId, teenProfileId),
        gte(nutritionLogs.date, threeDaysAgo.toISOString().split('T')[0])
      )
    )
    .groupBy(nutritionLogs.date);
  
  if (nutritionData.length < 2) return null;
  
  const veryLowDays = nutritionData.filter(
    day => day.totalCalories > 0 && day.totalCalories < 800
  ).length;
  
  if (veryLowDays < 2) return null;
  
  const rule = getRule('low_intake');
  if (!rule) return null;
  
  return {
    alertType: 'low_intake',
    severity: rule.severity,
    message: rule.getMessage({}),
    shareWithParent: rule.shareWithParent,
    resourceLink: rule.resourceLink,
  };
}

export async function runSafetyChecks(
  teenProfileId: string, 
  date: Date = new Date()
): Promise<SafetyAlert[]> {
  const results: SafetyAlert[] = [];
  
  const checks = [
    { check: checkSleepDeficit, type: 'sleep_deficit' as AlertType },
    { check: checkTrainingSpike, type: 'training_spike' as AlertType },
    { check: checkPainFlags, type: 'pain_flag' as AlertType },
    { check: checkLowEnergy, type: 'low_energy' as AlertType },
    { check: checkHighStress, type: 'high_stress' as AlertType },
    { check: checkRestrictiveEating, type: 'restrictive_eating' as AlertType },
    { check: checkOvertraining, type: 'overtraining' as AlertType },
    { check: checkLowIntake, type: 'low_intake' as AlertType },
  ];
  
  for (const { check, type } of checks) {
    try {
      const hasRecent = await checkRecentAlert(teenProfileId, type);
      if (hasRecent) continue;
      
      const result = await check(teenProfileId, date);
      if (result) {
        const [insertedAlert] = await db.insert(safetyAlerts).values({
          teenProfileId,
          alertType: result.alertType,
          severity: result.severity,
          message: result.message,
          shareWithParent: result.shareWithParent,
          resourceLink: result.resourceLink,
        }).returning();
        
        if (insertedAlert) {
          results.push(insertedAlert);
        }
      }
    } catch (error) {
      console.error(`Error running safety check ${type}:`, error);
    }
  }
  
  return results;
}

/**
 * Run daily safety checks for all teen profiles.
 * 
 * DEFERRED BY DESIGN: Cron scheduling and push notifications are deferred
 * to production configuration phase. This function provides the core logic
 * that should be invoked by the deployment's scheduling infrastructure.
 * 
 * PRODUCTION SETUP REQUIRED:
 * 1. Scheduled execution - Call this function daily via:
 *    - node-cron for simple scheduling
 *    - Bull/BullMQ for job queues
 *    - Cloud scheduler (AWS EventBridge, Google Cloud Scheduler, etc.)
 * 
 * 2. Push notifications - Integrate with notification service:
 *    - Expo Push Notifications (for React Native mobile app)
 *    - Firebase Cloud Messaging
 *    - OneSignal
 * 
 * Example cron setup:
 * ```
 * import cron from 'node-cron';
 * import { runDailySafetyChecks } from './services/safetyChecker';
 * 
 * // Run at 8am every day
 * cron.schedule('0 8 * * *', () => {
 *   runDailySafetyChecks();
 * });
 * ```
 */
export async function runDailySafetyChecks(): Promise<void> {
  const { notifyOfNewAlerts } = await import("./pushNotifications");
  
  const allTeenProfiles = await db
    .select({ id: teenProfiles.id })
    .from(teenProfiles);
  
  const today = new Date();
  
  for (const profile of allTeenProfiles) {
    try {
      const alerts = await runSafetyChecks(profile.id, today);
      if (alerts.length > 0) {
        console.log(`Created ${alerts.length} safety alerts for teen profile ${profile.id}`);
        await notifyOfNewAlerts(profile.id, alerts);
      }
    } catch (error) {
      console.error(`Error running safety checks for profile ${profile.id}:`, error);
    }
  }
}

import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addDays, setHours, setMinutes, setSeconds, setMilliseconds, differenceInMilliseconds } from 'date-fns';

let schedulerInterval: NodeJS.Timeout | null = null;
const teenScheduleTimeouts: Map<string, NodeJS.Timeout> = new Map();
const lastRunTimes: Map<string, Date> = new Map();

function getNextTargetTimeInTimezone(targetHour: number, timezone: string): Date {
  const now = new Date();
  const nowInTz = toZonedTime(now, timezone);
  
  let targetInTz = setMilliseconds(setSeconds(setMinutes(setHours(nowInTz, targetHour), 0), 0), 0);
  
  if (targetInTz <= nowInTz) {
    targetInTz = addDays(targetInTz, 1);
  }
  
  const targetUtc = fromZonedTime(targetInTz, timezone);
  
  return targetUtc;
}

function getMillisecondsUntilTargetHour(targetHour: number, timezone: string): number {
  const now = new Date();
  const nextTarget = getNextTargetTimeInTimezone(targetHour, timezone);
  const ms = differenceInMilliseconds(nextTarget, now);
  
  return Math.max(ms, 1000);
}

async function scheduleTeenCheck(
  teenProfileId: string, 
  profileId: string,
  targetHour: number,
  defaultTimezone: string = 'America/New_York'
): Promise<void> {
  const profileData = await db
    .select({ timezone: profiles.timezone })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  
  const timezone = profileData[0]?.timezone || defaultTimezone;
  const nextTargetTime = getNextTargetTimeInTimezone(targetHour, timezone);
  const msUntilTarget = Math.max(differenceInMilliseconds(nextTargetTime, new Date()), 1000);
  const hoursUntilTarget = (msUntilTarget / 1000 / 60 / 60).toFixed(2);
  
  console.log(`[SafetyChecker] Teen ${teenProfileId}: next check at ${nextTargetTime.toISOString()} (${hoursUntilTarget}h, ${targetHour}:00 ${timezone})`);
  
  const existingTimeout = teenScheduleTimeouts.get(teenProfileId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  const timeout = setTimeout(async () => {
    const lastRun = lastRunTimes.get(teenProfileId);
    const now = new Date();
    
    if (!lastRun) {
      const lastCheckResult = await db
        .select({ lastSafetyCheckAt: teenProfiles.lastSafetyCheckAt })
        .from(teenProfiles)
        .where(eq(teenProfiles.id, teenProfileId))
        .limit(1);
      
      if (lastCheckResult[0]?.lastSafetyCheckAt) {
        const lastCheckTime = new Date(lastCheckResult[0].lastSafetyCheckAt);
        if (differenceInMilliseconds(now, lastCheckTime) < 23 * 60 * 60 * 1000) {
          console.log(`[SafetyChecker] Teen ${teenProfileId}: skipping, DB shows recent check`);
          lastRunTimes.set(teenProfileId, lastCheckTime);
          scheduleTeenCheck(teenProfileId, profileId, targetHour, defaultTimezone);
          return;
        }
      }
    } else if (differenceInMilliseconds(now, lastRun) < 23 * 60 * 60 * 1000) {
      console.log(`[SafetyChecker] Teen ${teenProfileId}: skipping, ran recently`);
      scheduleTeenCheck(teenProfileId, profileId, targetHour, defaultTimezone);
      return;
    }
    
    console.log(`[SafetyChecker] Running safety check for teen ${teenProfileId}`);
    lastRunTimes.set(teenProfileId, now);
    
    await db
      .update(teenProfiles)
      .set({ lastSafetyCheckAt: now })
      .where(eq(teenProfiles.id, teenProfileId));
    
    try {
      const { notifyOfNewAlerts } = await import("./pushNotifications");
      const alerts = await runSafetyChecks(teenProfileId);
      if (alerts.length > 0) {
        console.log(`[SafetyChecker] Created ${alerts.length} alerts for teen ${teenProfileId}`);
        await notifyOfNewAlerts(teenProfileId, alerts);
      }
    } catch (error) {
      console.error(`[SafetyChecker] Error checking teen ${teenProfileId}:`, error);
    }
    
    scheduleTeenCheck(teenProfileId, profileId, targetHour, defaultTimezone);
  }, msUntilTarget);
  
  teenScheduleTimeouts.set(teenProfileId, timeout);
}

async function scheduleAllTeenChecks(targetHour: number = 8, defaultTimezone: string = 'America/New_York'): Promise<void> {
  const allTeenProfiles = await db
    .select({ 
      teenProfileId: teenProfiles.id,
      profileId: teenProfiles.profileId,
    })
    .from(teenProfiles);
  
  console.log(`[SafetyChecker] Scheduling checks for ${allTeenProfiles.length} teen(s) (default tz: ${defaultTimezone})`);
  
  for (const teen of allTeenProfiles) {
    const existingTimeout = teenScheduleTimeouts.get(teen.teenProfileId);
    if (!existingTimeout) {
      await scheduleTeenCheck(teen.teenProfileId, teen.profileId, targetHour, defaultTimezone);
    }
  }
}

export function startSafetyCheckScheduler(
  targetHour: number = 8, 
  defaultTimezone: string = 'America/New_York'
): void {
  if (schedulerInterval) {
    console.log("[SafetyChecker] Scheduler already running");
    return;
  }

  console.log(`[SafetyChecker] Starting per-teen scheduler (${targetHour}:00, default tz: ${defaultTimezone})`);
  console.log(`[SafetyChecker] No immediate run - each teen will be checked at their local ${targetHour}:00`);
  
  scheduleAllTeenChecks(targetHour, defaultTimezone).catch(err => {
    console.error("[SafetyChecker] Failed to schedule teen checks:", err);
  });
  
  schedulerInterval = setInterval(() => {
    scheduleAllTeenChecks(targetHour, defaultTimezone).catch(err => {
      console.error("[SafetyChecker] Failed to refresh teen schedules:", err);
    });
  }, 6 * 60 * 60 * 1000);
}

export function stopSafetyCheckScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  
  for (const [teenId, timeout] of teenScheduleTimeouts) {
    clearTimeout(timeout);
  }
  teenScheduleTimeouts.clear();
  
  console.log("[SafetyChecker] Scheduler stopped");
}
