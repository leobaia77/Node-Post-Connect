import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { authMiddleware, generateToken, hashPassword, comparePassword, requireRole, type AuthRequest } from "./auth";
import { 
  registerSchema, loginSchema, users, profiles, teenProfiles, dailyCheckins, sleepLogs, workoutLogs,
  nutritionLogs, ptRoutines, ptAdherenceLogs, ptRoutineExercises, braceSchedules,
  braceWearingLogs, symptomLogs, morningBriefs, recommendations, safetyAlerts, mentalHealthLogs
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { format, subDays } from "date-fns";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AUTH ROUTES
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const securityWordHash = data.securityWord ? await hashPassword(data.securityWord.toLowerCase()) : null;
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        securityWordHash,
        role: "user",
      });

      const profile = await storage.createProfile({
        userId: user.id,
        displayName: data.displayName,
      });

      let userProfile = null;
      if (user.role === "user") {
        userProfile = await storage.createTeenProfile({
          profileId: profile.id,
        });
      }

      const token = generateToken({ userId: user.id, role: user.role });
      const { passwordHash: _, securityWordHash: _s, ...safeUser } = user;
      res.json({ token, user: safeUser, profile, userProfile });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await comparePassword(data.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({ userId: user.id, role: user.role });
      const { passwordHash: _, securityWordHash: _s, ...safeUser } = user;

      const profile = await storage.getProfile(user.id);
      let userProfile = null;
      if (user.role === "user" && profile) {
        userProfile = await storage.getTeenProfile(profile.id);
      }

      res.json({ token, user: safeUser, profile, userProfile });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile = await storage.getProfile(user.id);
      let userProfile = null;
      if (user.role === "user" && profile) {
        userProfile = await storage.getTeenProfile(profile.id);
      }

      const { passwordHash: _, securityWordHash: _s, ...safeUser } = user;
      res.json({ user: safeUser, profile, userProfile });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // SECURITY WORD + PASSWORD RESET
  app.post("/api/auth/verify-security-word", authLimiter, async (req, res) => {
    try {
      const { email, securityWord } = req.body;
      if (!email || !securityWord) {
        return res.status(400).json({ error: "Email and security word are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.securityWordHash) {
        return res.json({ valid: false });
      }

      const valid = await comparePassword(securityWord.toLowerCase(), user.securityWordHash);
      res.json({ valid });
    } catch (error) {
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const { email, securityWord, newPassword } = req.body;
      if (!email || !securityWord || !newPassword) {
        return res.status(400).json({ error: "Email, security word, and new password are required" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.securityWordHash) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const validWord = await comparePassword(securityWord.toLowerCase(), user.securityWordHash);
      if (!validWord) {
        return res.status(400).json({ error: "Invalid security word" });
      }

      const newHash = await hashPassword(newPassword);
      await storage.updateUser(user.id, { passwordHash: newHash });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // ONBOARDING COMPLETE
  app.post("/api/onboarding/complete", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const updated = await storage.updateUser(req.user!.userId, { onboardingComplete: true });
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash: _, securityWordHash: _s, ...safeUser } = updated;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // PROFILE ROUTES
  app.get("/api/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  app.put("/api/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.updateProfile(req.user!.userId, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // USER GOALS ROUTES
  app.get("/api/goals", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const teenProfile = await storage.getTeenProfile(profile.id);
      res.json(teenProfile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get goals" });
    }
  });

  app.post("/api/goals", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      let teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) {
        teenProfile = await storage.createTeenProfile({
          profileId: profile.id,
          goals: req.body.goals,
          goalWeights: req.body.goalWeights,
        });
      }
      res.json(teenProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to save goals" });
    }
  });

  app.put("/api/goals", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      const teenProfile = await storage.updateTeenProfile(profile.id, req.body);
      res.json(teenProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goals" });
    }
  });

  // DAILY CHECK-IN ROUTES
  app.get("/api/checkins", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");
      
      const checkins = await storage.getCheckins(teenProfile.id, startDate, endDate);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ error: "Failed to get check-ins" });
    }
  });

  app.post("/api/checkin", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const checkinInput = z.object({
        energyLevel: z.number().min(1).max(10),
        sorenessLevel: z.number().min(1).max(10),
        moodLevel: z.number().min(1).max(10),
        stressLevel: z.number().min(1).max(10),
        painNotes: z.string().optional(),
        hasPainFlag: z.boolean().optional(),
      }).parse(req.body);

      const today = format(new Date(), "yyyy-MM-dd");
      const checkin = await storage.createCheckin({
        teenProfileId: teenProfile.id,
        date: today,
        ...checkinInput,
      });

      if (checkinInput.hasPainFlag) {
        await storage.createSafetyAlert({
          teenProfileId: teenProfile.id,
          alertType: "pain_flag",
          severity: "warning",
          message: `Pain reported: ${checkinInput.painNotes || "No details provided"}`,
        });
      }

      res.json(checkin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Checkin error:", error);
      res.status(500).json({ error: "Failed to save check-in" });
    }
  });

  // SLEEP LOG ROUTES
  app.get("/api/sleep", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");
      
      const logs = await storage.getSleepLogs(teenProfile.id, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sleep logs" });
    }
  });

  app.post("/api/sleep", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const sleepInput = z.object({
        date: z.string(),
        totalHours: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
        sleepQuality: z.number().min(1).max(10).optional(),
        nightWakeups: z.number().optional(),
        disturbances: z.array(z.string()).optional(),
        source: z.enum(["manual", "apple_health", "other"]).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const log = await storage.createSleepLog({
        teenProfileId: teenProfile.id,
        ...sleepInput,
      });
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Sleep log error:", error);
      res.status(500).json({ error: "Failed to save sleep log" });
    }
  });

  // WORKOUT LOG ROUTES
  app.get("/api/workouts", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");
      
      const logs = await storage.getWorkoutLogs(teenProfile.id, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get workout logs" });
    }
  });

  app.post("/api/workout", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const workoutInput = z.object({
        date: z.string(),
        workoutType: z.enum(["sport_practice", "gym", "pt_rehab", "mobility", "cardio", "other"]),
        sportName: z.string().optional(),
        durationMinutes: z.number().min(1),
        rpe: z.number().min(1).max(10).optional(),
        exercises: z.any().optional(),
        source: z.enum(["manual", "apple_health", "other"]).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const log = await storage.createWorkoutLog({
        teenProfileId: teenProfile.id,
        ...workoutInput,
      });
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Workout log error:", error);
      res.status(500).json({ error: "Failed to save workout log" });
    }
  });

  // NUTRITION LOG ROUTES
  app.get("/api/nutrition", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");
      
      const logs = await storage.getNutritionLogs(teenProfile.id, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get nutrition logs" });
    }
  });

  app.post("/api/nutrition", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const nutritionInput = z.object({
        date: z.string(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        calories: z.number().optional(),
        proteinG: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
        carbsG: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
        fatG: z.union([z.string(), z.number()]).transform(v => String(v)).optional(),
        source: z.enum(["manual", "apple_health", "other"]).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const log = await storage.createNutritionLog({
        teenProfileId: teenProfile.id,
        ...nutritionInput,
      });
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Nutrition log error:", error);
      res.status(500).json({ error: "Failed to save nutrition log" });
    }
  });

  // MENTAL HEALTH LOG ROUTES
  app.get("/api/mental-health", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");

      const logs = await storage.getMentalHealthLogs(teenProfile.id, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get mental health logs" });
    }
  });

  app.post("/api/mental-health", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const mentalHealthInput = z.object({
        date: z.string(),
        type: z.enum(["mood", "anxiety", "stress", "motivation", "body_image", "social", "general"]),
        subType: z.string().optional(),
        durationMinutes: z.number().optional(),
        moodLevel: z.number().min(1).max(10).optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const log = await storage.createMentalHealthLog({
        teenProfileId: teenProfile.id,
        ...mentalHealthInput,
      });
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Mental health log error:", error);
      res.status(500).json({ error: "Failed to save mental health log" });
    }
  });

  // PT ROUTINE ROUTES
  app.get("/api/pt-routines", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const routines = await storage.getPtRoutines(teenProfile.id);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: "Failed to get PT routines" });
    }
  });

  app.post("/api/pt-routine", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "User profile not found" });

      const routine = await storage.createPtRoutine({
        teenProfileId: teenProfile.id,
        ...req.body,
      });
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to save PT routine" });
    }
  });

  // PT ADHERENCE ROUTES
  app.get("/api/pt-adherence", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const routineId = req.query.routine_id as string;
      if (!routineId) return res.status(400).json({ error: "Routine ID required" });

      const startDate = req.query.start_date as string || format(subDays(new Date(), 30), "yyyy-MM-dd");
      const endDate = req.query.end_date as string || format(new Date(), "yyyy-MM-dd");
      
      const logs = await storage.getPtAdherenceLogs(routineId, startDate, endDate);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get PT adherence logs" });
    }
  });

  app.post("/api/pt-adherence", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const log = await storage.createPtAdherenceLog(req.body);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to save PT adherence log" });
    }
  });

  // SAFETY ALERTS ROUTES (first registration removed - duplicate was at line ~754 with proper role check)

  // HEALTH SYNC ROUTES (Apple HealthKit)
  app.post("/api/health-sync", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const { sleep, workouts, activity, nutrition } = req.body;
      
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) {
        return res.status(404).json({ error: "Teen profile not found" });
      }

      let sleepSynced = 0;
      let workoutsSynced = 0;
      let nutritionSynced = 0;

      // Sync sleep data - create new entries (duplicates handled by unique constraint if exists)
      if (Array.isArray(sleep)) {
        for (const entry of sleep) {
          try {
            await storage.createSleepLog({
              teenProfileId: teenProfile.id,
              date: entry.date,
              totalHours: String(entry.totalHours),
              bedtime: entry.bedtime,
              wakeTime: entry.wakeTime,
              source: "apple_health",
            });
            sleepSynced++;
          } catch (e) {
            // Entry may already exist for this date - this is expected
            console.log('Sleep entry already exists or failed:', entry.date);
          }
        }
      }

      // Sync workout data
      if (Array.isArray(workouts)) {
        for (const entry of workouts) {
          try {
            const workoutType = mapHealthKitWorkoutType(entry.workoutType) as "cardio" | "other" | "sport_practice" | "gym" | "pt_rehab" | "mobility";
            await storage.createWorkoutLog({
              teenProfileId: teenProfile.id,
              date: entry.date,
              workoutType,
              durationMinutes: entry.durationMinutes,
              rpe: 5,
              source: "apple_health",
              notes: entry.avgHeartRate ? `Avg HR: ${entry.avgHeartRate} bpm` : null,
            });
            workoutsSynced++;
          } catch (e) {
            console.log('Workout entry failed:', entry.date);
          }
        }
      }

      // Sync nutrition data (only if data present)
      if (nutrition && nutrition.calories !== null) {
        try {
          await storage.createNutritionLog({
            teenProfileId: teenProfile.id,
            date: nutrition.date,
            mealType: 'snack', // Use snack as catch-all for daily totals
            calories: nutrition.calories,
            proteinG: nutrition.protein ? String(nutrition.protein) : null,
            carbsG: nutrition.carbohydrates ? String(nutrition.carbohydrates) : null,
            fatG: nutrition.fat ? String(nutrition.fat) : null,
            source: "apple_health",
            notes: 'Daily total synced from Apple Health',
          });
          nutritionSynced = 1;
        } catch (e) {
          console.log('Nutrition entry failed:', nutrition.date);
        }
      }

      res.json({
        success: true,
        syncedAt: new Date().toISOString(),
        summary: {
          sleep: sleepSynced,
          workouts: workoutsSynced,
          nutrition: nutritionSynced,
        },
      });
    } catch (error) {
      console.error("Error syncing health data:", error);
      res.status(500).json({ error: "Failed to sync health data" });
    }
  });

  // Helper function to map HealthKit workout types to our enum
  function mapHealthKitWorkoutType(hkType: string): string {
    const mapping: Record<string, string> = {
      'Running': 'cardio',
      'Cycling': 'cardio',
      'Swimming': 'cardio',
      'Walking': 'cardio',
      'Hiking': 'cardio',
      'Soccer': 'sport_practice',
      'Basketball': 'sport_practice',
      'Tennis': 'sport_practice',
      'Volleyball': 'sport_practice',
      'Baseball': 'sport_practice',
      'American Football': 'sport_practice',
      'Traditional Strength Training': 'gym',
      'Functional Strength Training': 'gym',
      'Yoga': 'mobility',
      'Dance': 'cardio',
      'Cross Training': 'cardio',
      'Mixed Metabolic Cardio Training': 'cardio',
    };
    return mapping[hkType] || 'other';
  }

  // MORNING BRIEF ROUTES
  app.get("/api/morning-brief", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json(null);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json(null);

      const today = format(new Date(), "yyyy-MM-dd");
      let brief = await storage.getMorningBrief(teenProfile.id, today);
      
      if (!brief) {
        const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
        const sleepLogs = await storage.getSleepLogs(teenProfile.id, weekAgo, today);
        const workoutLogs = await storage.getWorkoutLogs(teenProfile.id, weekAgo, today);
        const checkins = await storage.getCheckins(teenProfile.id, weekAgo, today);

        const avgSleep = sleepLogs.length > 0
          ? sleepLogs.reduce((sum, log) => sum + Number(log.totalHours || 0), 0) / sleepLogs.length
          : 0;
        const totalTraining = workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
        const latestCheckin = checkins[0];

        brief = await storage.createMorningBrief({
          teenProfileId: teenProfile.id,
          date: today,
          briefJson: {
            avgSleepHours: avgSleep.toFixed(1),
            weeklyTrainingMinutes: totalTraining,
            latestEnergy: latestCheckin?.energyLevel || null,
            latestMood: latestCheckin?.moodLevel || null,
            summary: `You've averaged ${avgSleep.toFixed(1)} hours of sleep and ${Math.round(totalTraining / 60)} hours of training this week.`,
          },
        });
      }

      res.json(brief);
    } catch (error) {
      res.status(500).json({ error: "Failed to get morning brief" });
    }
  });

  // RECOMMENDATIONS ROUTES
  app.get("/api/recommendations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
        return res.status(503).json({ error: "AI recommendations service unavailable" });
      }

      const { date } = req.query;
      const targetDate = date ? String(date) : format(new Date(), "yyyy-MM-dd");

      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) {
        return res.status(404).json({ error: "Teen profile not found" });
      }

      const { getOrGenerateRecommendations, buildMorningBrief } = await import("./services/llmOrchestrator");

      let recommendations = await getOrGenerateRecommendations(teenProfile.id, targetDate);
      
      if (!recommendations) {
        const brief = await buildMorningBrief(teenProfile.id, targetDate);
        
        await storage.createMorningBrief({
          teenProfileId: teenProfile.id,
          date: targetDate,
          briefJson: brief as unknown as Record<string, unknown>,
        });

        recommendations = await getOrGenerateRecommendations(teenProfile.id, targetDate);
      }

      res.json(recommendations);
    } catch (error: any) {
      console.error("Error generating recommendations:", error);
      if (error.message?.includes("AI Integrations not configured")) {
        return res.status(503).json({ error: "AI recommendations service unavailable" });
      }
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Action completion tracking (stored client-side, this just acknowledges)
  app.post("/api/recommendations/actions/complete", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const { actionId, completed } = req.body;
      
      if (!actionId || typeof completed !== 'boolean') {
        return res.status(400).json({ error: "actionId and completed are required" });
      }

      // Action completion is tracked client-side in secure storage
      // This endpoint exists for future server-side tracking/analytics
      res.json({ 
        success: true, 
        actionId, 
        completed,
        trackedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error tracking action completion:", error);
      res.status(500).json({ error: "Failed to track action completion" });
    }
  });

  // SAFETY ALERTS ROUTES
  
  // Get alerts for current teen user
  app.get("/api/safety-alerts", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) {
        return res.status(404).json({ error: "Teen profile not found" });
      }

      const alerts = await storage.getSafetyAlerts(teenProfile.id);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching safety alerts:", error);
      res.status(500).json({ error: "Failed to get safety alerts" });
    }
  });

  // Acknowledge an alert (teen)
  app.put("/api/safety-alerts/:id/acknowledge", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const alertId = req.params.id as string;
      const alert = await storage.getAlertById(alertId);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile || teenProfile.id !== alert.teenProfileId) {
        return res.status(403).json({ error: "Not authorized to acknowledge this alert" });
      }

      const updated = await storage.acknowledgeAlert(alertId);
      res.json(updated);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Trigger safety check (for testing/manual trigger)
  app.post("/api/safety-check", authMiddleware, requireRole("user"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) {
        return res.status(404).json({ error: "Teen profile not found" });
      }

      const { runSafetyChecks } = await import("./services/safetyChecker");
      const alerts = await runSafetyChecks(teenProfile.id);
      
      res.json({ 
        message: `Safety check complete. ${alerts.length} new alert(s) created.`,
        alerts 
      });
    } catch (error) {
      console.error("Error running safety check:", error);
      res.status(500).json({ error: "Failed to run safety check" });
    }
  });

  // SCOLIOSIS SUPPORT ROUTES

  // PT Exercises - Get all available exercises
  app.get("/api/scoliosis/exercises", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const exercises = await storage.getPtExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to get exercises" });
    }
  });

  // PT Exercises - Create new exercise
  app.post("/api/scoliosis/exercises", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { name, description, durationSeconds, reps, sets, videoUrl, targetArea } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Exercise name is required" });
      }

      const exercise = await storage.createPtExercise({
        name,
        description: description || null,
        durationSeconds: durationSeconds || null,
        reps: reps || null,
        sets: sets || null,
        videoUrl: videoUrl || null,
        targetArea: targetArea || null,
      });

      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to create exercise" });
    }
  });

  // PT Routines with exercises
  app.get("/api/scoliosis/routines", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const routines = await storage.getPtRoutines(teenProfile.id);
      
      // Get exercises for each routine
      const routinesWithExercises = await Promise.all(
        routines.map(async (routine) => {
          const exercises = await storage.getPtExercisesByRoutine(routine.id);
          return { ...routine, exercises };
        })
      );

      res.json(routinesWithExercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to get routines" });
    }
  });

  // Add exercise to routine
  app.post("/api/scoliosis/routines/:routineId/exercises", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const routineId = req.params.routineId as string;
      const { exerciseId, orderIndex, customNotes } = req.body;

      if (!exerciseId) {
        return res.status(400).json({ error: "Exercise ID is required" });
      }

      const routineExercise = await storage.addExerciseToRoutine({
        routineId,
        exerciseId,
        orderIndex: orderIndex || 0,
        customNotes: customNotes || null,
      });

      res.json(routineExercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to add exercise to routine" });
    }
  });

  // PT Adherence logs by profile
  app.get("/api/scoliosis/pt-adherence", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const start = startDate ? String(startDate) : format(subDays(new Date(), 30), "yyyy-MM-dd");
      const end = endDate ? String(endDate) : format(new Date(), "yyyy-MM-dd");

      const logs = await storage.getPtAdherenceLogsByProfile(teenProfile.id, start, end);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get PT adherence logs" });
    }
  });

  // Create or update PT adherence log
  app.post("/api/scoliosis/pt-adherence", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { routineId, date, completed, durationMinutes, exercisesCompleted, notes, difficultyRating, painLevel, backFeeling, cobbAngle, lastMeasuredDate, braceMinutes } = req.body;

      if (!routineId) {
        return res.status(400).json({ error: "Routine ID is required" });
      }

      const log = await storage.createPtAdherenceLog({
        routineId,
        date: date || format(new Date(), "yyyy-MM-dd"),
        completed: completed || false,
        durationMinutes: durationMinutes || null,
        exercisesCompleted: exercisesCompleted || [],
        notes: notes || null,
        difficultyRating: difficultyRating || null,
        painLevel: painLevel || null,
        backFeeling: backFeeling || null,
        cobbAngle: cobbAngle || null,
        lastMeasuredDate: lastMeasuredDate || null,
        braceMinutes: braceMinutes || null,
      });

      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to log PT adherence" });
    }
  });

  // Update PT adherence log
  app.patch("/api/scoliosis/pt-adherence/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const adherenceId = req.params.id as string;
      const log = await storage.updatePtAdherenceLog(adherenceId, req.body);
      
      if (!log) {
        return res.status(404).json({ error: "PT adherence log not found" });
      }
      
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to update PT adherence log" });
    }
  });

  // Brace Schedule routes
  app.get("/api/scoliosis/brace-schedule", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const schedule = await storage.getBraceSchedule(teenProfile.id);
      res.json(schedule || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get brace schedule" });
    }
  });

  app.post("/api/scoliosis/brace-schedule", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const { dailyTargetHours, schedule: scheduleData, prescribedBy, startDate } = req.body;

      const braceSchedule = await storage.createBraceSchedule({
        teenProfileId: teenProfile.id,
        dailyTargetHours: String(dailyTargetHours || 16),
        schedule: scheduleData || [],
        prescribedBy: prescribedBy || null,
        startDate: startDate || format(new Date(), "yyyy-MM-dd"),
      });

      res.json(braceSchedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create brace schedule" });
    }
  });

  app.patch("/api/scoliosis/brace-schedule/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const scheduleId = req.params.id as string;
      const schedule = await storage.updateBraceSchedule(scheduleId, req.body);
      
      if (!schedule) {
        return res.status(404).json({ error: "Brace schedule not found" });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update brace schedule" });
    }
  });

  // Brace wearing logs
  app.get("/api/scoliosis/brace-logs", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { date, startDate, endDate } = req.query;
      
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      if (date) {
        const logs = await storage.getBraceWearingLogs(teenProfile.id, String(date));
        res.json(logs);
      } else {
        const start = startDate ? String(startDate) : format(subDays(new Date(), 7), "yyyy-MM-dd");
        const end = endDate ? String(endDate) : format(new Date(), "yyyy-MM-dd");
        const logs = await storage.getBraceWearingLogsByRange(teenProfile.id, start, end);
        res.json(logs);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get brace wearing logs" });
    }
  });

  // Get active brace session (for timer)
  app.get("/api/scoliosis/brace-logs/active", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const activeSession = await storage.getActiveBraceSession(teenProfile.id);
      res.json(activeSession || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get active brace session" });
    }
  });

  // Start brace wearing session
  app.post("/api/scoliosis/brace-logs/start", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      // Check for existing active session
      const activeSession = await storage.getActiveBraceSession(teenProfile.id);
      if (activeSession) {
        return res.status(400).json({ error: "Already have an active brace session" });
      }

      const now = new Date();
      const log = await storage.createBraceWearingLog({
        teenProfileId: teenProfile.id,
        date: format(now, "yyyy-MM-dd"),
        startTime: now,
        endTime: null,
        durationMinutes: null,
        notes: req.body.notes || null,
      });

      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to start brace session" });
    }
  });

  // End brace wearing session
  app.post("/api/scoliosis/brace-logs/:id/end", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const now = new Date();

      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });
      
      const existingLogs = await storage.getBraceWearingLogsByRange(
        teenProfile.id, 
        format(subDays(now, 1), "yyyy-MM-dd"),
        format(now, "yyyy-MM-dd")
      );
      const log = existingLogs.find(l => l.id === id);
      
      if (!log) {
        return res.status(404).json({ error: "Brace session not found" });
      }

      if (log.teenProfileId !== teenProfile.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const startTime = new Date(log.startTime);
      const durationMinutes = Math.round((now.getTime() - startTime.getTime()) / 60000);

      const braceLogId = id;
      const updated = await storage.updateBraceWearingLog(braceLogId as string, {
        endTime: now,
        durationMinutes,
        notes: req.body.notes || log.notes,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to end brace session" });
    }
  });

  // Manual brace log entry
  app.post("/api/scoliosis/brace-logs", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const { date, startTime, endTime, durationMinutes, notes } = req.body;

      const log = await storage.createBraceWearingLog({
        teenProfileId: teenProfile.id,
        date: date || format(new Date(), "yyyy-MM-dd"),
        startTime,
        endTime,
        durationMinutes,
        notes: notes || null,
      });

      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create brace log" });
    }
  });

  // Symptom logs routes
  app.get("/api/scoliosis/symptoms", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { startDate, endDate, date } = req.query;
      
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      if (date) {
        const log = await storage.getSymptomLogByDate(teenProfile.id, String(date));
        res.json(log || null);
      } else {
        const start = startDate ? String(startDate) : format(subDays(new Date(), 30), "yyyy-MM-dd");
        const end = endDate ? String(endDate) : format(new Date(), "yyyy-MM-dd");
        const logs = await storage.getSymptomLogs(teenProfile.id, start, end);
        res.json(logs);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get symptom logs" });
    }
  });

  app.post("/api/scoliosis/symptoms", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const { date, curveDiscomfort, backPainLocation, newSymptoms, redFlags } = req.body;

      const log = await storage.createSymptomLog({
        teenProfileId: teenProfile.id,
        date: date || format(new Date(), "yyyy-MM-dd"),
        curveDiscomfort: curveDiscomfort || 1,
        backPainLocation: backPainLocation || [],
        newSymptoms: newSymptoms || null,
        redFlags: redFlags || [],
      });

      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to log symptoms" });
    }
  });

  app.patch("/api/scoliosis/symptoms/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const symptomId = req.params.id as string;
      const log = await storage.updateSymptomLog(symptomId, req.body);
      
      if (!log) {
        return res.status(404).json({ error: "Symptom log not found" });
      }
      
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to update symptom log" });
    }
  });

  // Get scoliosis support status for teen
  app.get("/api/scoliosis/status", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const today = format(new Date(), "yyyy-MM-dd");
      const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

      const [braceSchedule, todayBraceLogs, weekPtLogs, todaySymptoms] = await Promise.all([
        storage.getBraceSchedule(teenProfile.id),
        storage.getBraceWearingLogs(teenProfile.id, today),
        storage.getPtAdherenceLogsByProfile(teenProfile.id, weekAgo, today),
        storage.getSymptomLogByDate(teenProfile.id, today),
      ]);

      // Calculate today's brace wearing time
      const todayBraceMinutes = todayBraceLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
      const todayBraceHours = Math.round(todayBraceMinutes / 60 * 10) / 10;

      // Calculate PT adherence for the week
      const completedPtSessions = weekPtLogs.filter(log => log.completed).length;
      const routines = await storage.getPtRoutines(teenProfile.id);
      const expectedSessions = routines.reduce((sum, r) => sum + (r.frequencyPerWeek || 0), 0);

      res.json({
        hasScoliosisSupport: teenProfile.hasScoliosisSupport,
        braceSchedule,
        todayBraceHours,
        braceTargetHours: braceSchedule?.dailyTargetHours || 0,
        weeklyPtCompleted: completedPtSessions,
        weeklyPtTarget: expectedSessions,
        hasSymptomLog: !!todaySymptoms,
        latestSymptom: todaySymptoms,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get scoliosis status" });
    }
  });

  // Enable scoliosis support for teen profile
  app.post("/api/scoliosis/enable", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const updated = await storage.updateTeenProfile(profile.id, { hasScoliosisSupport: true });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to enable scoliosis support" });
    }
  });

  // PUSH TOKEN REGISTRATION
  app.post("/api/push-token", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { pushToken } = req.body;
      
      if (!pushToken || typeof pushToken !== "string") {
        return res.status(400).json({ error: "Push token is required" });
      }

      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const updated = await storage.updateProfile(req.user!.userId, { pushToken });
      res.json({ message: "Push token registered successfully", profile: updated });
    } catch (error) {
      console.error("Error registering push token:", error);
      res.status(500).json({ error: "Failed to register push token" });
    }
  });

  // DATA EXPORT - Required for App Store compliance
  // Allows users to export all their health data in JSON or CSV format
  app.get("/api/export-data", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const formatType = (req.query.format as string) || "json";
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile = await storage.getProfile(user.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const exportData: Record<string, unknown> = {
        exportDate: new Date().toISOString(),
        user: {
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        profile: {
          displayName: profile.displayName,
          ageRange: profile.ageRange,
          timezone: profile.timezone,
        },
      };

      // Export all health data for users
      if (user.role === "user") {
        const userProfile = await storage.getTeenProfileByUserId(user.id);
        if (userProfile) {
          const startDate = "2020-01-01";
          const endDate = format(new Date(), "yyyy-MM-dd");

          exportData.userProfile = {
            goals: userProfile.goals,
            goalWeights: userProfile.goalWeights,
            sports: userProfile.sports,
            weeklyAvailability: userProfile.weeklyAvailability,
            hasScoliosisSupport: userProfile.hasScoliosisSupport,
          };

          // Fetch all health logs
          const [checkins, sleepLogs, workoutLogs, nutritionLogs, ptRoutines] = await Promise.all([
            storage.getCheckins(userProfile.id, startDate, endDate),
            storage.getSleepLogs(userProfile.id, startDate, endDate),
            storage.getWorkoutLogs(userProfile.id, startDate, endDate),
            storage.getNutritionLogs(userProfile.id, startDate, endDate),
            storage.getPtRoutines(userProfile.id),
          ]);

          exportData.dailyCheckins = checkins;
          exportData.sleepLogs = sleepLogs;
          exportData.workoutLogs = workoutLogs;
          exportData.nutritionLogs = nutritionLogs;
          exportData.ptRoutines = ptRoutines;

          // Fetch PT adherence logs for all routines
          if (ptRoutines.length > 0) {
            const ptAdherenceLogs = await Promise.all(
              ptRoutines.map(routine => storage.getPtAdherenceLogs(routine.id, startDate, endDate))
            );
            exportData.ptAdherenceLogs = ptAdherenceLogs.flat();
          }

          // Fetch scoliosis data if enabled
          if (userProfile.hasScoliosisSupport) {
            const [braceSchedule, braceLogs, symptomLogs] = await Promise.all([
              storage.getBraceSchedule(userProfile.id),
              storage.getBraceWearingLogsByRange(userProfile.id, startDate, endDate),
              storage.getSymptomLogs(userProfile.id, startDate, endDate),
            ]);

            exportData.braceSchedule = braceSchedule;
            exportData.braceWearingLogs = braceLogs;
            exportData.symptomLogs = symptomLogs;
          }

          // Fetch safety alerts
          const alerts = await storage.getSafetyAlerts(userProfile.id);
          exportData.safetyAlerts = alerts;
        }
      }

      if (formatType === "csv") {
        // Convert to CSV format
        const flattenObject = (obj: Record<string, unknown>, prefix = ""): Record<string, string> => {
          const result: Record<string, string> = {};
          for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}_${key}` : key;
            if (value && typeof value === "object" && !Array.isArray(value)) {
              Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
            } else if (Array.isArray(value)) {
              result[newKey] = JSON.stringify(value);
            } else {
              result[newKey] = String(value ?? "");
            }
          }
          return result;
        };

        const flattened = flattenObject(exportData);
        const headers = Object.keys(flattened).join(",");
        const values = Object.values(flattened).map(v => `"${v.replace(/"/g, '""')}"`).join(",");
        const csv = `${headers}\n${values}`;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="growthtrack-export-${format(new Date(), "yyyy-MM-dd")}.csv"`);
        res.send(csv);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="growthtrack-export-${format(new Date(), "yyyy-MM-dd")}.json"`);
        res.json(exportData);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // EMAIL DATA EXPORT (stub - email service not yet configured)
  app.post("/api/data-export/email", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { format: exportFormat } = req.body;
      const validFormat = exportFormat === "csv" ? "csv" : "json";

      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        message: `Email export is not yet available. Please use GET /api/export-data?format=${validFormat} to download your data directly.`,
        format: validFormat,
        email: user.email,
        stub: true,
      });
    } catch (error) {
      console.error("Error queueing email export:", error);
      res.status(500).json({ error: "Failed to queue data export" });
    }
  });

  // ACCOUNT DELETION - Required for App Store compliance
  app.delete("/api/account", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { confirmEmail } = req.body;
      const user = await storage.getUser(req.user!.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Require email confirmation for safety
      if (confirmEmail !== user.email) {
        return res.status(400).json({ error: "Email confirmation does not match. Please confirm your email to delete your account." });
      }

      const profile = await storage.getProfile(user.id);
      
      // Delete all associated data in correct order (respecting foreign keys)
      if (user.role === "user" && profile) {
        const userProfile = await storage.getTeenProfile(profile.id);
        if (userProfile) {
          // Delete health logs first (they reference user profile)
          await db.delete(dailyCheckins).where(eq(dailyCheckins.teenProfileId, userProfile.id));
          await db.delete(sleepLogs).where(eq(sleepLogs.teenProfileId, userProfile.id));
          await db.delete(workoutLogs).where(eq(workoutLogs.teenProfileId, userProfile.id));
          await db.delete(nutritionLogs).where(eq(nutritionLogs.teenProfileId, userProfile.id));
          
          // Delete PT routines and adherence logs
          const routines = await storage.getPtRoutines(userProfile.id);
          for (const routine of routines) {
            await db.delete(ptRoutineExercises).where(eq(ptRoutineExercises.routineId, routine.id));
            await db.delete(ptAdherenceLogs).where(eq(ptAdherenceLogs.routineId, routine.id));
          }
          await db.delete(ptRoutines).where(eq(ptRoutines.teenProfileId, userProfile.id));
          
          // Delete scoliosis data
          await db.delete(braceWearingLogs).where(eq(braceWearingLogs.teenProfileId, userProfile.id));
          await db.delete(braceSchedules).where(eq(braceSchedules.teenProfileId, userProfile.id));
          await db.delete(symptomLogs).where(eq(symptomLogs.teenProfileId, userProfile.id));
          
          // Delete morning briefs and recommendations
          const briefs = await db.select().from(morningBriefs).where(eq(morningBriefs.teenProfileId, userProfile.id));
          for (const brief of briefs) {
            await db.delete(recommendations).where(eq(recommendations.morningBriefId, brief.id));
          }
          await db.delete(morningBriefs).where(eq(morningBriefs.teenProfileId, userProfile.id));
          
          // Delete mental health logs
          await db.delete(mentalHealthLogs).where(eq(mentalHealthLogs.teenProfileId, userProfile.id));

          // Delete safety alerts
          await db.delete(safetyAlerts).where(eq(safetyAlerts.teenProfileId, userProfile.id));
          
          // Delete user profile
          await db.delete(teenProfiles).where(eq(teenProfiles.id, userProfile.id));
        }
      }

      // Delete profile and user
      if (profile) {
        await db.delete(profiles).where(eq(profiles.id, profile.id));
      }
      await db.delete(users).where(eq(users.id, user.id));

      res.json({ message: "Account and all associated data have been permanently deleted" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  return httpServer;
}
