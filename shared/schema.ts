import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, integer, decimal, date, boolean, jsonb, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// IMPORTANT: Health data is NOT used for advertising - Apple HealthKit requirement
// All health data is stored securely and only shared according to user preferences

// Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const ageRangeEnum = pgEnum("age_range", ["13-14", "15-16", "17-19"]);
export const dataSourceEnum = pgEnum("data_source", ["manual", "apple_health", "other"]);
export const workoutTypeEnum = pgEnum("workout_type", ["sport_practice", "gym", "pt_rehab", "mobility", "cardio", "other", "strength", "hiit", "flexibility", "swimming", "water_polo", "running", "yoga"]);
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);
export const alertTypeEnum = pgEnum("alert_type", ["sleep_deficit", "training_spike", "pain_flag", "low_intake", "overtraining", "low_energy", "high_stress", "restrictive_eating"]);
export const severityEnum = pgEnum("severity", ["info", "warning", "critical"]);
export const mentalHealthTypeEnum = pgEnum("mental_health_type", ["mood", "anxiety", "stress", "motivation", "body_image", "social", "general"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  securityWordHash: text("security_word_hash"),
  role: userRoleEnum("role").notNull().default("user"),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  ageRange: ageRangeEnum("age_range"),
  timezone: varchar("timezone", { length: 50 }).default("America/New_York"),
  pushToken: text("push_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Teen profiles table
export const teenProfiles = pgTable("teen_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => profiles.id).notNull().unique(),
  goals: jsonb("goals").$type<string[]>().default([]),
  goalWeights: jsonb("goal_weights").$type<Record<string, number>>().default({}),
  sports: jsonb("sports").$type<{ name: string; level: string; seasonStart?: string; seasonEnd?: string }[]>().default([]),
  weeklyAvailability: jsonb("weekly_availability").$type<Record<string, string[]>>().default({}),
  hasScoliosisSupport: boolean("has_scoliosis_support").default(false),
  lastSafetyCheckAt: timestamp("last_safety_check_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Note: Parent-teen links, parent guardrails, and teen sharing preferences tables
// have been removed as the app now uses simplified user/admin roles only

// Daily check-ins table
export const dailyCheckins = pgTable("daily_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  energyLevel: integer("energy_level").notNull(),
  sorenessLevel: integer("soreness_level").notNull(),
  moodLevel: integer("mood_level").notNull(),
  stressLevel: integer("stress_level").notNull(),
  painNotes: text("pain_notes"),
  hasPainFlag: boolean("has_pain_flag").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("daily_checkins_teen_date_unique").on(table.teenProfileId, table.date),
]);

// Sleep logs table
export const sleepLogs = pgTable("sleep_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  sleepQuality: integer("sleep_quality"),
  nightWakeups: integer("night_wakeups"),
  disturbances: text("disturbances").array(),
  source: dataSourceEnum("source").default("manual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout logs table
export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  workoutType: workoutTypeEnum("workout_type").notNull(),
  sportName: varchar("sport_name", { length: 100 }),
  durationMinutes: integer("duration_minutes").notNull(),
  rpe: integer("rpe"),
  exercises: jsonb("exercises").$type<{ name: string; sets?: number; reps?: number; weight?: number }[]>().default([]),
  notes: text("notes"),
  source: dataSourceEnum("source").default("manual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Nutrition logs table
export const nutritionLogs = pgTable("nutrition_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  calories: integer("calories"),
  proteinG: decimal("protein_g", { precision: 6, scale: 2 }),
  carbsG: decimal("carbs_g", { precision: 6, scale: 2 }),
  fatG: decimal("fat_g", { precision: 6, scale: 2 }),
  notes: text("notes"),
  source: dataSourceEnum("source").default("manual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PT routines table (for scoliosis support)
export const ptRoutines = pgTable("pt_routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  routineName: varchar("routine_name", { length: 200 }).notNull(),
  exercises: jsonb("exercises").$type<{ name: string; sets?: number; reps?: number; duration?: string; notes?: string }[]>().default([]),
  prescribedBy: varchar("prescribed_by", { length: 100 }),
  frequencyPerWeek: integer("frequency_per_week").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// PT adherence logs table
export const ptAdherenceLogs = pgTable("pt_adherence_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id").references(() => ptRoutines.id).notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").default(false),
  exercisesCompleted: jsonb("exercises_completed").$type<string[]>().default([]),
  durationMinutes: integer("duration_minutes"),
  difficultyRating: integer("difficulty_rating"),
  painLevel: varchar("pain_level", { length: 20 }),
  backFeeling: varchar("back_feeling", { length: 100 }),
  cobbAngle: decimal("cobb_angle", { precision: 5, scale: 1 }),
  lastMeasuredDate: date("last_measured_date"),
  braceMinutes: integer("brace_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PT exercises table - individual exercises that can be part of routines
export const ptExercises = pgTable("pt_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  targetArea: varchar("target_area", { length: 100 }),
  durationSeconds: integer("duration_seconds"),
  sets: integer("sets"),
  reps: integer("reps"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PT routine exercises junction table
export const ptRoutineExercises = pgTable("pt_routine_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id").references(() => ptRoutines.id).notNull(),
  exerciseId: uuid("exercise_id").references(() => ptExercises.id).notNull(),
  orderIndex: integer("order_index").default(0),
  customNotes: text("custom_notes"),
});

// Brace schedules table - for scoliosis brace wearing
export const braceSchedules = pgTable("brace_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  dailyTargetHours: decimal("daily_target_hours", { precision: 4, scale: 1 }).notNull(),
  schedule: jsonb("schedule").$type<{ startTime: string; endTime: string; label?: string }[]>().default([]),
  prescribedBy: varchar("prescribed_by", { length: 100 }),
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Brace wearing logs table - tracks actual brace wearing
export const braceWearingLogs = pgTable("brace_wearing_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationMinutes: integer("duration_minutes"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Symptom logs table - for tracking scoliosis symptoms
export const symptomLogs = pgTable("symptom_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  curveDiscomfort: integer("curve_discomfort").notNull(), // 1-5 scale
  backPainLocation: jsonb("back_pain_location").$type<{ x: number; y: number; label?: string }[]>().default([]),
  newSymptoms: text("new_symptoms"),
  redFlags: jsonb("red_flags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Morning briefs table
export const morningBriefs = pgTable("morning_briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  briefJson: jsonb("brief_json").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recommendations table
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  morningBriefId: uuid("morning_brief_id").references(() => morningBriefs.id).notNull(),
  recommendationsJson: jsonb("recommendations_json").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Safety alerts table
export const safetyAlerts = pgTable("safety_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  alertType: alertTypeEnum("alert_type").notNull(),
  severity: severityEnum("severity").notNull(),
  message: text("message").notNull(),
  acknowledged: boolean("acknowledged").default(false),
  resourceLink: text("resource_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mental health logs table
export const mentalHealthLogs = pgTable("mental_health_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  type: mentalHealthTypeEnum("type").notNull(),
  subType: varchar("sub_type", { length: 100 }),
  durationMinutes: integer("duration_minutes"),
  moodLevel: integer("mood_level"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export const insertTeenProfileSchema = createInsertSchema(teenProfiles).omit({
  id: true,
  createdAt: true,
});


export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  createdAt: true,
});

export const insertSleepLogSchema = createInsertSchema(sleepLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPtRoutineSchema = createInsertSchema(ptRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPtAdherenceLogSchema = createInsertSchema(ptAdherenceLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPtExerciseSchema = createInsertSchema(ptExercises).omit({
  id: true,
  createdAt: true,
});

export const insertPtRoutineExerciseSchema = createInsertSchema(ptRoutineExercises).omit({
  id: true,
});

export const insertBraceScheduleSchema = createInsertSchema(braceSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBraceWearingLogSchema = createInsertSchema(braceWearingLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({
  id: true,
  createdAt: true,
});

export const insertMorningBriefSchema = createInsertSchema(morningBriefs).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertSafetyAlertSchema = createInsertSchema(safetyAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertMentalHealthLogSchema = createInsertSchema(mentalHealthLogs).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(100),
  securityWord: z.string().min(2).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type TeenProfile = typeof teenProfiles.$inferSelect;
export type InsertTeenProfile = z.infer<typeof insertTeenProfileSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;
export type PtRoutine = typeof ptRoutines.$inferSelect;
export type InsertPtRoutine = z.infer<typeof insertPtRoutineSchema>;
export type PtAdherenceLog = typeof ptAdherenceLogs.$inferSelect;
export type InsertPtAdherenceLog = z.infer<typeof insertPtAdherenceLogSchema>;
export type PtExercise = typeof ptExercises.$inferSelect;
export type InsertPtExercise = z.infer<typeof insertPtExerciseSchema>;
export type PtRoutineExercise = typeof ptRoutineExercises.$inferSelect;
export type InsertPtRoutineExercise = z.infer<typeof insertPtRoutineExerciseSchema>;
export type BraceSchedule = typeof braceSchedules.$inferSelect;
export type InsertBraceSchedule = z.infer<typeof insertBraceScheduleSchema>;
export type BraceWearingLog = typeof braceWearingLogs.$inferSelect;
export type InsertBraceWearingLog = z.infer<typeof insertBraceWearingLogSchema>;
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = z.infer<typeof insertSymptomLogSchema>;
export type MorningBrief = typeof morningBriefs.$inferSelect;
export type InsertMorningBrief = z.infer<typeof insertMorningBriefSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type SafetyAlert = typeof safetyAlerts.$inferSelect;
export type InsertSafetyAlert = z.infer<typeof insertSafetyAlertSchema>;
export type MentalHealthLog = typeof mentalHealthLogs.$inferSelect;
export type InsertMentalHealthLog = z.infer<typeof insertMentalHealthLogSchema>;
