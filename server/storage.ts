import { db } from "./db";
import { eq, and, gte, lte, desc, isNull } from "drizzle-orm";
import {
  users, profiles, teenProfiles, dailyCheckins, sleepLogs, workoutLogs,
  nutritionLogs, ptRoutines, ptAdherenceLogs, ptExercises, ptRoutineExercises,
  braceSchedules, braceWearingLogs, symptomLogs, morningBriefs,
  recommendations, safetyAlerts, mentalHealthLogs,
  type User, type InsertUser, type Profile, type InsertProfile,
  type TeenProfile, type InsertTeenProfile, type DailyCheckin, type InsertDailyCheckin,
  type SleepLog, type InsertSleepLog, type WorkoutLog, type InsertWorkoutLog,
  type NutritionLog, type InsertNutritionLog, type PtRoutine, type InsertPtRoutine,
  type PtAdherenceLog, type InsertPtAdherenceLog, type PtExercise, type InsertPtExercise,
  type PtRoutineExercise, type InsertPtRoutineExercise, type BraceSchedule, type InsertBraceSchedule,
  type BraceWearingLog, type InsertBraceWearingLog, type SymptomLog, type InsertSymptomLog,
  type MorningBrief, type InsertMorningBrief,
  type Recommendation, type InsertRecommendation, type SafetyAlert, type InsertSafetyAlert,
  type MentalHealthLog, type InsertMentalHealthLog
} from "@shared/schema";

// IMPORTANT: Health data is NOT used for advertising - Apple HealthKit requirement
// All health data is stored securely and only shared according to user preferences

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined>;

  // Teen Profiles
  getTeenProfile(profileId: string): Promise<TeenProfile | undefined>;
  getTeenProfileByUserId(userId: string): Promise<TeenProfile | undefined>;
  createTeenProfile(data: InsertTeenProfile): Promise<TeenProfile>;
  updateTeenProfile(profileId: string, data: Partial<TeenProfile>): Promise<TeenProfile | undefined>;


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
  getPtAdherenceLogsByProfile(teenProfileId: string, startDate: string, endDate: string): Promise<PtAdherenceLog[]>;
  createPtAdherenceLog(data: InsertPtAdherenceLog): Promise<PtAdherenceLog>;
  updatePtAdherenceLog(id: string, data: Partial<PtAdherenceLog>): Promise<PtAdherenceLog | undefined>;

  // PT Exercises
  getPtExercises(): Promise<PtExercise[]>;
  getPtExercisesByRoutine(routineId: string): Promise<(PtRoutineExercise & { exercise: PtExercise })[]>;
  createPtExercise(data: InsertPtExercise): Promise<PtExercise>;
  addExerciseToRoutine(data: InsertPtRoutineExercise): Promise<PtRoutineExercise>;

  // Brace Schedules
  getBraceSchedule(teenProfileId: string): Promise<BraceSchedule | undefined>;
  createBraceSchedule(data: InsertBraceSchedule): Promise<BraceSchedule>;
  updateBraceSchedule(id: string, data: Partial<BraceSchedule>): Promise<BraceSchedule | undefined>;

  // Brace Wearing Logs
  getBraceWearingLogs(teenProfileId: string, date: string): Promise<BraceWearingLog[]>;
  getBraceWearingLogsByRange(teenProfileId: string, startDate: string, endDate: string): Promise<BraceWearingLog[]>;
  createBraceWearingLog(data: InsertBraceWearingLog): Promise<BraceWearingLog>;
  updateBraceWearingLog(id: string, data: Partial<BraceWearingLog>): Promise<BraceWearingLog | undefined>;
  getActiveBraceSession(teenProfileId: string): Promise<BraceWearingLog | undefined>;

  // Symptom Logs
  getSymptomLogs(teenProfileId: string, startDate: string, endDate: string): Promise<SymptomLog[]>;
  getSymptomLogByDate(teenProfileId: string, date: string): Promise<SymptomLog | undefined>;
  createSymptomLog(data: InsertSymptomLog): Promise<SymptomLog>;
  updateSymptomLog(id: string, data: Partial<SymptomLog>): Promise<SymptomLog | undefined>;

  // Morning Briefs
  getMorningBrief(teenProfileId: string, date: string): Promise<MorningBrief | undefined>;
  createMorningBrief(data: InsertMorningBrief): Promise<MorningBrief>;

  // Recommendations
  getRecommendation(morningBriefId: string): Promise<Recommendation | undefined>;
  createRecommendation(data: InsertRecommendation): Promise<Recommendation>;

  // Safety Alerts
  getSafetyAlerts(teenProfileId: string): Promise<SafetyAlert[]>;
  getUnacknowledgedAlerts(teenProfileId: string): Promise<SafetyAlert[]>;
  getAlertById(id: string): Promise<SafetyAlert | undefined>;
  createSafetyAlert(data: InsertSafetyAlert): Promise<SafetyAlert>;
  acknowledgeAlert(id: string): Promise<SafetyAlert | undefined>;

  // Mental Health Logs
  getMentalHealthLogs(teenProfileId: string, startDate: string, endDate: string): Promise<MentalHealthLog[]>;
  createMentalHealthLog(data: InsertMentalHealthLog): Promise<MentalHealthLog>;
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

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
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
        eq(safetyAlerts.acknowledged, false)
      ))
      .orderBy(desc(safetyAlerts.createdAt));
  }

  async createSafetyAlert(data: InsertSafetyAlert): Promise<SafetyAlert> {
    const result = await db.insert(safetyAlerts).values(data).returning();
    return result[0];
  }

  async getAlertById(id: string): Promise<SafetyAlert | undefined> {
    const result = await db.select().from(safetyAlerts)
      .where(eq(safetyAlerts.id, id))
      .limit(1);
    return result[0];
  }

  async acknowledgeAlert(id: string): Promise<SafetyAlert | undefined> {
    const result = await db.update(safetyAlerts).set({ acknowledged: true }).where(eq(safetyAlerts.id, id)).returning();
    return result[0];
  }

  // PT Adherence - Additional Methods
  async getPtAdherenceLogsByProfile(teenProfileId: string, startDate: string, endDate: string): Promise<PtAdherenceLog[]> {
    const routines = await this.getPtRoutines(teenProfileId);
    if (routines.length === 0) return [];
    
    const allLogs: PtAdherenceLog[] = [];
    for (const routine of routines) {
      const logs = await this.getPtAdherenceLogs(routine.id, startDate, endDate);
      allLogs.push(...logs);
    }
    return allLogs;
  }

  async updatePtAdherenceLog(id: string, data: Partial<PtAdherenceLog>): Promise<PtAdherenceLog | undefined> {
    const result = await db.update(ptAdherenceLogs).set(data).where(eq(ptAdherenceLogs.id, id)).returning();
    return result[0];
  }

  // PT Exercises
  async getPtExercises(): Promise<PtExercise[]> {
    return db.select().from(ptExercises).orderBy(ptExercises.name);
  }

  async getPtExercisesByRoutine(routineId: string): Promise<(PtRoutineExercise & { exercise: PtExercise })[]> {
    const result = await db.select({
      id: ptRoutineExercises.id,
      routineId: ptRoutineExercises.routineId,
      exerciseId: ptRoutineExercises.exerciseId,
      orderIndex: ptRoutineExercises.orderIndex,
      customNotes: ptRoutineExercises.customNotes,
      exercise: ptExercises,
    }).from(ptRoutineExercises)
      .innerJoin(ptExercises, eq(ptRoutineExercises.exerciseId, ptExercises.id))
      .where(eq(ptRoutineExercises.routineId, routineId))
      .orderBy(ptRoutineExercises.orderIndex);
    
    return result.map(r => ({
      ...r,
      exercise: r.exercise,
    }));
  }

  async createPtExercise(data: InsertPtExercise): Promise<PtExercise> {
    const result = await db.insert(ptExercises).values(data).returning();
    return result[0];
  }

  async addExerciseToRoutine(data: InsertPtRoutineExercise): Promise<PtRoutineExercise> {
    const result = await db.insert(ptRoutineExercises).values(data).returning();
    return result[0];
  }

  // Brace Schedules
  async getBraceSchedule(teenProfileId: string): Promise<BraceSchedule | undefined> {
    const result = await db.select().from(braceSchedules)
      .where(eq(braceSchedules.teenProfileId, teenProfileId))
      .orderBy(desc(braceSchedules.createdAt))
      .limit(1);
    return result[0];
  }

  async createBraceSchedule(data: InsertBraceSchedule): Promise<BraceSchedule> {
    const result = await db.insert(braceSchedules).values(data).returning();
    return result[0];
  }

  async updateBraceSchedule(id: string, data: Partial<BraceSchedule>): Promise<BraceSchedule | undefined> {
    const result = await db.update(braceSchedules).set(data).where(eq(braceSchedules.id, id)).returning();
    return result[0];
  }

  // Brace Wearing Logs
  async getBraceWearingLogs(teenProfileId: string, date: string): Promise<BraceWearingLog[]> {
    return db.select().from(braceWearingLogs)
      .where(and(
        eq(braceWearingLogs.teenProfileId, teenProfileId),
        eq(braceWearingLogs.date, date)
      ))
      .orderBy(desc(braceWearingLogs.startTime));
  }

  async getBraceWearingLogsByRange(teenProfileId: string, startDate: string, endDate: string): Promise<BraceWearingLog[]> {
    return db.select().from(braceWearingLogs)
      .where(and(
        eq(braceWearingLogs.teenProfileId, teenProfileId),
        gte(braceWearingLogs.date, startDate),
        lte(braceWearingLogs.date, endDate)
      ))
      .orderBy(desc(braceWearingLogs.date), desc(braceWearingLogs.startTime));
  }

  async createBraceWearingLog(data: InsertBraceWearingLog): Promise<BraceWearingLog> {
    const result = await db.insert(braceWearingLogs).values(data).returning();
    return result[0];
  }

  async updateBraceWearingLog(id: string, data: Partial<BraceWearingLog>): Promise<BraceWearingLog | undefined> {
    const result = await db.update(braceWearingLogs).set(data).where(eq(braceWearingLogs.id, id)).returning();
    return result[0];
  }

  async getActiveBraceSession(teenProfileId: string): Promise<BraceWearingLog | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const result = await db.select().from(braceWearingLogs)
      .where(and(
        eq(braceWearingLogs.teenProfileId, teenProfileId),
        eq(braceWearingLogs.date, today),
        isNull(braceWearingLogs.endTime)
      ))
      .orderBy(desc(braceWearingLogs.startTime))
      .limit(1);
    return result[0];
  }

  // Symptom Logs
  async getSymptomLogs(teenProfileId: string, startDate: string, endDate: string): Promise<SymptomLog[]> {
    return db.select().from(symptomLogs)
      .where(and(
        eq(symptomLogs.teenProfileId, teenProfileId),
        gte(symptomLogs.date, startDate),
        lte(symptomLogs.date, endDate)
      ))
      .orderBy(desc(symptomLogs.date));
  }

  async getSymptomLogByDate(teenProfileId: string, date: string): Promise<SymptomLog | undefined> {
    const result = await db.select().from(symptomLogs)
      .where(and(
        eq(symptomLogs.teenProfileId, teenProfileId),
        eq(symptomLogs.date, date)
      ))
      .limit(1);
    return result[0];
  }

  async createSymptomLog(data: InsertSymptomLog): Promise<SymptomLog> {
    const result = await db.insert(symptomLogs).values(data).returning();
    return result[0];
  }

  async updateSymptomLog(id: string, data: Partial<SymptomLog>): Promise<SymptomLog | undefined> {
    const result = await db.update(symptomLogs).set(data).where(eq(symptomLogs.id, id)).returning();
    return result[0];
  }

  // Mental Health Logs
  async getMentalHealthLogs(teenProfileId: string, startDate: string, endDate: string): Promise<MentalHealthLog[]> {
    return db.select().from(mentalHealthLogs)
      .where(and(
        eq(mentalHealthLogs.teenProfileId, teenProfileId),
        gte(mentalHealthLogs.date, startDate),
        lte(mentalHealthLogs.date, endDate)
      ))
      .orderBy(desc(mentalHealthLogs.date));
  }

  async createMentalHealthLog(data: InsertMentalHealthLog): Promise<MentalHealthLog> {
    const result = await db.insert(mentalHealthLogs).values(data).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
