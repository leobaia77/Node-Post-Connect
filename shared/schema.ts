import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, integer, decimal, date, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// IMPORTANT: Health data is NOT used for advertising - Apple HealthKit requirement
// All health data is stored securely and only shared according to user preferences

// Enums
export const userRoleEnum = pgEnum("user_role", ["teen", "parent", "admin"]);
export const ageRangeEnum = pgEnum("age_range", ["13-14", "15-16", "17-19"]);
export const linkStatusEnum = pgEnum("link_status", ["pending", "active", "revoked"]);
export const supervisionLevelEnum = pgEnum("supervision_level", ["summary_only", "detailed"]);
export const dataSourceEnum = pgEnum("data_source", ["manual", "apple_health", "other"]);
export const workoutTypeEnum = pgEnum("workout_type", ["sport_practice", "gym", "pt_rehab", "mobility", "cardio", "other"]);
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack"]);
export const alertTypeEnum = pgEnum("alert_type", ["sleep_deficit", "training_spike", "pain_flag", "low_intake", "overtraining", "low_energy", "high_stress", "restrictive_eating"]);
export const severityEnum = pgEnum("severity", ["info", "warning", "critical"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("teen"),
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

// Parent-teen links table
export const parentTeenLinks = pgTable("parent_teen_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentUserId: uuid("parent_user_id").references(() => users.id).notNull(),
  teenUserId: uuid("teen_user_id").references(() => users.id),
  inviteCode: varchar("invite_code", { length: 20 }).unique().notNull(),
  status: linkStatusEnum("status").default("pending").notNull(),
  supervisionLevel: supervisionLevelEnum("supervision_level").default("summary_only").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Parent guardrails table
export const parentGuardrails = pgTable("parent_guardrails", {
  id: uuid("id").primaryKey().defaultRandom(),
  linkId: uuid("link_id").references(() => parentTeenLinks.id).notNull().unique(),
  maxWeeklyTrainingMinutes: integer("max_weekly_training_minutes"),
  minNightlySleepHours: decimal("min_nightly_sleep_hours", { precision: 3, scale: 1 }).default("8.0"),
  noWeightLossMode: boolean("no_weight_loss_mode").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teen sharing preferences table
export const teenSharingPreferences = pgTable("teen_sharing_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull().unique(),
  shareSleepTrend: boolean("share_sleep_trend").default(true),
  shareTrainingTrend: boolean("share_training_trend").default(true),
  shareNutritionTrend: boolean("share_nutrition_trend").default(true),
  shareDetailedLogs: boolean("share_detailed_logs").default(false),
});

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
});

// Sleep logs table
export const sleepLogs = pgTable("sleep_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  teenProfileId: uuid("teen_profile_id").references(() => teenProfiles.id).notNull(),
  date: date("date").notNull(),
  bedtime: timestamp("bedtime"),
  wakeTime: timestamp("wake_time"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
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
  shareWithParent: boolean("share_with_parent").default(true),
  acknowledgedByTeen: boolean("acknowledged_by_teen").default(false),
  acknowledgedByParent: boolean("acknowledged_by_parent").default(false),
  resourceLink: text("resource_link"),
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

export const insertParentTeenLinkSchema = createInsertSchema(parentTeenLinks).omit({
  id: true,
  createdAt: true,
});

export const insertParentGuardrailsSchema = createInsertSchema(parentGuardrails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeenSharingPreferencesSchema = createInsertSchema(teenSharingPreferences).omit({
  id: true,
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

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["teen", "parent", "admin"]),
  displayName: z.string().min(2).max(100),
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
export type ParentTeenLink = typeof parentTeenLinks.$inferSelect;
export type InsertParentTeenLink = z.infer<typeof insertParentTeenLinkSchema>;
export type ParentGuardrails = typeof parentGuardrails.$inferSelect;
export type InsertParentGuardrails = z.infer<typeof insertParentGuardrailsSchema>;
export type TeenSharingPreferences = typeof teenSharingPreferences.$inferSelect;
export type InsertTeenSharingPreferences = z.infer<typeof insertTeenSharingPreferencesSchema>;
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
