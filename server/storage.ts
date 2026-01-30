import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  users, profiles, teenProfiles, parentTeenLinks, parentGuardrails,
  teenSharingPreferences, dailyCheckins, sleepLogs, workoutLogs,
  nutritionLogs, ptRoutines, ptAdherenceLogs, morningBriefs,
  recommendations, safetyAlerts,
  type User, type InsertUser, type Profile, type InsertProfile,
  type TeenProfile, type InsertTeenProfile, type ParentTeenLink, type InsertParentTeenLink,
  type ParentGuardrails, type InsertParentGuardrails, type TeenSharingPreferences,
  type InsertTeenSharingPreferences, type DailyCheckin, type InsertDailyCheckin,
  type SleepLog, type InsertSleepLog, type WorkoutLog, type InsertWorkoutLog,
  type NutritionLog, type InsertNutritionLog, type PtRoutine, type InsertPtRoutine,
  type PtAdherenceLog, type InsertPtAdherenceLog, type MorningBrief, type InsertMorningBrief,
  type Recommendation, type InsertRecommendation, type SafetyAlert, type InsertSafetyAlert
} from "@shared/schema";

// IMPORTANT: Health data is NOT used for advertising - Apple HealthKit requirement
// All health data is stored securely and only shared according to user preferences

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined>;

  // Teen Profiles
  getTeenProfile(profileId: string): Promise<TeenProfile | undefined>;
  getTeenProfileByUserId(userId: string): Promise<TeenProfile | undefined>;
  createTeenProfile(data: InsertTeenProfile): Promise<TeenProfile>;
  updateTeenProfile(profileId: string, data: Partial<TeenProfile>): Promise<TeenProfile | undefined>;

  // Parent-Teen Links
  createLink(data: InsertParentTeenLink): Promise<ParentTeenLink>;
  getLinkByCode(code: string): Promise<ParentTeenLink | undefined>;
  getLinksByParent(parentUserId: string): Promise<ParentTeenLink[]>;
  getLinksByTeen(teenUserId: string): Promise<ParentTeenLink[]>;
  updateLink(id: string, data: Partial<ParentTeenLink>): Promise<ParentTeenLink | undefined>;

  // Parent Guardrails
  getGuardrails(linkId: string): Promise<ParentGuardrails | undefined>;
  createGuardrails(data: InsertParentGuardrails): Promise<ParentGuardrails>;
  updateGuardrails(linkId: string, data: Partial<ParentGuardrails>): Promise<ParentGuardrails | undefined>;

  // Teen Sharing Preferences
  getSharingPreferences(teenProfileId: string): Promise<TeenSharingPreferences | undefined>;
  createSharingPreferences(data: InsertTeenSharingPreferences): Promise<TeenSharingPreferences>;
  updateSharingPreferences(teenProfileId: string, data: Partial<TeenSharingPreferences>): Promise<TeenSharingPreferences | undefined>;

  // Daily Check-ins
  getCheckins(teenProfileId: string, startDate: string, endDate: string): Promise<DailyCheckin[]>;
  createCheckin(data: InsertDailyCheckin): Promise<DailyCheckin>;
  getCheckinByDate(teenProfileId: string, date: string): Promise<DailyCheckin | undefined>;

  // Sleep Logs
  getSleepLogs(teenProfileId: string, startDate: string, endDate: string): Promise<SleepLog[]>;
  createSleepLog(data: InsertSleepLog): Promise<SleepLog>;

  // Workout Logs
  getWorkoutLogs(teenProfileId: string, startDate: string, endDate: string): Promise<WorkoutLog[]>;
  createWorkoutLog(data: InsertWorkoutLog): Promise<WorkoutLog>;

  // Nutrition Logs
  getNutritionLogs(teenProfileId: string, startDate: string, endDate: string): Promise<NutritionLog[]>;
  createNutritionLog(data: InsertNutritionLog): Promise<NutritionLog>;

  // PT Routines
  getPtRoutines(teenProfileId: string): Promise<PtRoutine[]>;
  createPtRoutine(data: InsertPtRoutine): Promise<PtRoutine>;

  // PT Adherence Logs
  getPtAdherenceLogs(routineId: string, startDate: string, endDate: string): Promise<PtAdherenceLog[]>;
  createPtAdherenceLog(data: InsertPtAdherenceLog): Promise<PtAdherenceLog>;

  // Morning Briefs
  getMorningBrief(teenProfileId: string, date: string): Promise<MorningBrief | undefined>;
  createMorningBrief(data: InsertMorningBrief): Promise<MorningBrief>;

  // Recommendations
  getRecommendation(morningBriefId: string): Promise<Recommendation | undefined>;
  createRecommendation(data: InsertRecommendation): Promise<Recommendation>;

  // Safety Alerts
  getSafetyAlerts(teenProfileId: string): Promise<SafetyAlert[]>;
  getUnacknowledgedAlerts(teenProfileId: string): Promise<SafetyAlert[]>;
  getParentVisibleAlerts(teenProfileId: string): Promise<SafetyAlert[]>;
  getAlertById(id: string): Promise<SafetyAlert | undefined>;
  createSafetyAlert(data: InsertSafetyAlert): Promise<SafetyAlert>;
  acknowledgeAlert(id: string, byTeen: boolean, byParent: boolean): Promise<SafetyAlert | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set(data).where(eq(profiles.userId, userId)).returning();
    return result[0];
  }

  // Teen Profiles
  async getTeenProfile(profileId: string): Promise<TeenProfile | undefined> {
    const result = await db.select().from(teenProfiles).where(eq(teenProfiles.profileId, profileId)).limit(1);
    return result[0];
  }

  async getTeenProfileByUserId(userId: string): Promise<TeenProfile | undefined> {
    const profile = await this.getProfile(userId);
    if (!profile) return undefined;
    return this.getTeenProfile(profile.id);
  }

  async createTeenProfile(data: InsertTeenProfile): Promise<TeenProfile> {
    const result = await db.insert(teenProfiles).values(data).returning();
    return result[0];
  }

  async updateTeenProfile(profileId: string, data: Partial<TeenProfile>): Promise<TeenProfile | undefined> {
    const result = await db.update(teenProfiles).set(data).where(eq(teenProfiles.profileId, profileId)).returning();
    return result[0];
  }

  // Parent-Teen Links
  async createLink(data: InsertParentTeenLink): Promise<ParentTeenLink> {
    const result = await db.insert(parentTeenLinks).values(data).returning();
    return result[0];
  }

  async getLinkByCode(code: string): Promise<ParentTeenLink | undefined> {
    const result = await db.select().from(parentTeenLinks).where(eq(parentTeenLinks.inviteCode, code)).limit(1);
    return result[0];
  }

  async getLinksByParent(parentUserId: string): Promise<ParentTeenLink[]> {
    return db.select().from(parentTeenLinks).where(eq(parentTeenLinks.parentUserId, parentUserId));
  }

  async getLinksByTeen(teenUserId: string): Promise<ParentTeenLink[]> {
    return db.select().from(parentTeenLinks).where(eq(parentTeenLinks.teenUserId, teenUserId));
  }

  async updateLink(id: string, data: Partial<ParentTeenLink>): Promise<ParentTeenLink | undefined> {
    const result = await db.update(parentTeenLinks).set(data).where(eq(parentTeenLinks.id, id)).returning();
    return result[0];
  }

  // Parent Guardrails
  async getGuardrails(linkId: string): Promise<ParentGuardrails | undefined> {
    const result = await db.select().from(parentGuardrails).where(eq(parentGuardrails.linkId, linkId)).limit(1);
    return result[0];
  }

  async createGuardrails(data: InsertParentGuardrails): Promise<ParentGuardrails> {
    const result = await db.insert(parentGuardrails).values(data).returning();
    return result[0];
  }

  async updateGuardrails(linkId: string, data: Partial<ParentGuardrails>): Promise<ParentGuardrails | undefined> {
    const result = await db.update(parentGuardrails).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(parentGuardrails.linkId, linkId)).returning();
    return result[0];
  }

  // Teen Sharing Preferences
  async getSharingPreferences(teenProfileId: string): Promise<TeenSharingPreferences | undefined> {
    const result = await db.select().from(teenSharingPreferences).where(eq(teenSharingPreferences.teenProfileId, teenProfileId)).limit(1);
    return result[0];
  }

  async createSharingPreferences(data: InsertTeenSharingPreferences): Promise<TeenSharingPreferences> {
    const result = await db.insert(teenSharingPreferences).values(data).returning();
    return result[0];
  }

  async updateSharingPreferences(teenProfileId: string, data: Partial<TeenSharingPreferences>): Promise<TeenSharingPreferences | undefined> {
    const result = await db.update(teenSharingPreferences).set(data).where(eq(teenSharingPreferences.teenProfileId, teenProfileId)).returning();
    return result[0];
  }

  // Daily Check-ins
  async getCheckins(teenProfileId: string, startDate: string, endDate: string): Promise<DailyCheckin[]> {
    return db.select().from(dailyCheckins)
      .where(and(
        eq(dailyCheckins.teenProfileId, teenProfileId),
        gte(dailyCheckins.date, startDate),
        lte(dailyCheckins.date, endDate)
      ))
      .orderBy(desc(dailyCheckins.date));
  }

  async createCheckin(data: InsertDailyCheckin): Promise<DailyCheckin> {
    const result = await db.insert(dailyCheckins).values(data).returning();
    return result[0];
  }

  async getCheckinByDate(teenProfileId: string, date: string): Promise<DailyCheckin | undefined> {
    const result = await db.select().from(dailyCheckins)
      .where(and(eq(dailyCheckins.teenProfileId, teenProfileId), eq(dailyCheckins.date, date)))
      .limit(1);
    return result[0];
  }

  // Sleep Logs
  async getSleepLogs(teenProfileId: string, startDate: string, endDate: string): Promise<SleepLog[]> {
    return db.select().from(sleepLogs)
      .where(and(
        eq(sleepLogs.teenProfileId, teenProfileId),
        gte(sleepLogs.date, startDate),
        lte(sleepLogs.date, endDate)
      ))
      .orderBy(desc(sleepLogs.date));
  }

  async createSleepLog(data: InsertSleepLog): Promise<SleepLog> {
    const result = await db.insert(sleepLogs).values(data).returning();
    return result[0];
  }

  // Workout Logs
  async getWorkoutLogs(teenProfileId: string, startDate: string, endDate: string): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs)
      .where(and(
        eq(workoutLogs.teenProfileId, teenProfileId),
        gte(workoutLogs.date, startDate),
        lte(workoutLogs.date, endDate)
      ))
      .orderBy(desc(workoutLogs.date));
  }

  async createWorkoutLog(data: InsertWorkoutLog): Promise<WorkoutLog> {
    const result = await db.insert(workoutLogs).values(data).returning();
    return result[0];
  }

  // Nutrition Logs
  async getNutritionLogs(teenProfileId: string, startDate: string, endDate: string): Promise<NutritionLog[]> {
    return db.select().from(nutritionLogs)
      .where(and(
        eq(nutritionLogs.teenProfileId, teenProfileId),
        gte(nutritionLogs.date, startDate),
        lte(nutritionLogs.date, endDate)
      ))
      .orderBy(desc(nutritionLogs.date));
  }

  async createNutritionLog(data: InsertNutritionLog): Promise<NutritionLog> {
    const result = await db.insert(nutritionLogs).values(data).returning();
    return result[0];
  }

  // PT Routines
  async getPtRoutines(teenProfileId: string): Promise<PtRoutine[]> {
    return db.select().from(ptRoutines).where(eq(ptRoutines.teenProfileId, teenProfileId));
  }

  async createPtRoutine(data: InsertPtRoutine): Promise<PtRoutine> {
    const result = await db.insert(ptRoutines).values(data).returning();
    return result[0];
  }

  // PT Adherence Logs
  async getPtAdherenceLogs(routineId: string, startDate: string, endDate: string): Promise<PtAdherenceLog[]> {
    return db.select().from(ptAdherenceLogs)
      .where(and(
        eq(ptAdherenceLogs.routineId, routineId),
        gte(ptAdherenceLogs.date, startDate),
        lte(ptAdherenceLogs.date, endDate)
      ))
      .orderBy(desc(ptAdherenceLogs.date));
  }

  async createPtAdherenceLog(data: InsertPtAdherenceLog): Promise<PtAdherenceLog> {
    const result = await db.insert(ptAdherenceLogs).values(data).returning();
    return result[0];
  }

  // Morning Briefs
  async getMorningBrief(teenProfileId: string, date: string): Promise<MorningBrief | undefined> {
    const result = await db.select().from(morningBriefs)
      .where(and(eq(morningBriefs.teenProfileId, teenProfileId), eq(morningBriefs.date, date)))
      .limit(1);
    return result[0];
  }

  async createMorningBrief(data: InsertMorningBrief): Promise<MorningBrief> {
    const result = await db.insert(morningBriefs).values(data).returning();
    return result[0];
  }

  // Recommendations
  async getRecommendation(morningBriefId: string): Promise<Recommendation | undefined> {
    const result = await db.select().from(recommendations).where(eq(recommendations.morningBriefId, morningBriefId)).limit(1);
    return result[0];
  }

  async createRecommendation(data: InsertRecommendation): Promise<Recommendation> {
    const result = await db.insert(recommendations).values(data).returning();
    return result[0];
  }

  // Safety Alerts
  async getSafetyAlerts(teenProfileId: string): Promise<SafetyAlert[]> {
    return db.select().from(safetyAlerts)
      .where(eq(safetyAlerts.teenProfileId, teenProfileId))
      .orderBy(desc(safetyAlerts.createdAt));
  }

  async getUnacknowledgedAlerts(teenProfileId: string): Promise<SafetyAlert[]> {
    return db.select().from(safetyAlerts)
      .where(and(
        eq(safetyAlerts.teenProfileId, teenProfileId),
        eq(safetyAlerts.acknowledgedByTeen, false)
      ))
      .orderBy(desc(safetyAlerts.createdAt));
  }

  async createSafetyAlert(data: InsertSafetyAlert): Promise<SafetyAlert> {
    const result = await db.insert(safetyAlerts).values(data).returning();
    return result[0];
  }

  async getParentVisibleAlerts(teenProfileId: string): Promise<SafetyAlert[]> {
    return db.select().from(safetyAlerts)
      .where(and(
        eq(safetyAlerts.teenProfileId, teenProfileId),
        eq(safetyAlerts.shareWithParent, true)
      ))
      .orderBy(desc(safetyAlerts.createdAt));
  }

  async getAlertById(id: string): Promise<SafetyAlert | undefined> {
    const result = await db.select().from(safetyAlerts)
      .where(eq(safetyAlerts.id, id))
      .limit(1);
    return result[0];
  }

  async acknowledgeAlert(id: string, byTeen: boolean, byParent: boolean): Promise<SafetyAlert | undefined> {
    const updates: Partial<SafetyAlert> = {};
    if (byTeen) updates.acknowledgedByTeen = true;
    if (byParent) updates.acknowledgedByParent = true;
    const result = await db.update(safetyAlerts).set(updates).where(eq(safetyAlerts.id, id)).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
