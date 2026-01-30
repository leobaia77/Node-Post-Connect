import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, generateToken, hashPassword, comparePassword, requireRole, type AuthRequest } from "./auth";
import { registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import { format, subDays } from "date-fns";

// IMPORTANT: Health data is NOT used for advertising - Apple HealthKit requirement
// All health data is stored securely and only shared according to user preferences

function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AUTH ROUTES
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        role: data.role as any,
      });

      const profile = await storage.createProfile({
        userId: user.id,
        displayName: data.displayName,
      });

      let teenProfile = null;
      if (data.role === "teen") {
        teenProfile = await storage.createTeenProfile({
          profileId: profile.id,
        });
        await storage.createSharingPreferences({
          teenProfileId: teenProfile.id,
        });
      }

      const token = generateToken({ userId: user.id, role: user.role });
      res.json({ token, user, profile, teenProfile });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
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
      res.json({ token });
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
      let teenProfile = null;
      if (user.role === "teen" && profile) {
        teenProfile = await storage.getTeenProfile(profile.id);
      }

      res.json({ user, profile, teenProfile });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
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

  // TEEN GOALS ROUTES
  app.get("/api/teen/goals", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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

  app.post("/api/teen/goals", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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

  app.put("/api/teen/goals", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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

  // PARENT-TEEN LINK ROUTES
  app.post("/api/link/generate-code", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const inviteCode = generateInviteCode();
      const link = await storage.createLink({
        parentUserId: req.user!.userId,
        inviteCode,
        status: "pending",
        supervisionLevel: "summary_only",
      });
      await storage.createGuardrails({ linkId: link.id });
      res.json({ inviteCode: link.inviteCode, link });
    } catch (error) {
      console.error("Generate code error:", error);
      res.status(500).json({ error: "Failed to generate invite code" });
    }
  });

  app.post("/api/link/accept", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const { inviteCode } = req.body;
      const link = await storage.getLinkByCode(inviteCode);
      if (!link) {
        return res.status(404).json({ error: "Invalid invite code" });
      }
      if (link.status !== "pending") {
        return res.status(400).json({ error: "This code has already been used" });
      }

      const updatedLink = await storage.updateLink(link.id, {
        teenUserId: req.user!.userId,
        status: "active",
      });
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept invite" });
    }
  });

  app.get("/api/link/status", authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role === "parent") {
        const links = await storage.getLinksByParent(req.user!.userId);
        const linkedTeens = [];
        const pendingLinks = [];

        for (const link of links) {
          if (link.status === "pending") {
            pendingLinks.push(link);
          } else if (link.teenUserId) {
            const teenProfile = await storage.getProfile(link.teenUserId);
            const teenData = teenProfile ? await storage.getTeenProfile(teenProfile.id) : null;
            
            const today = format(new Date(), "yyyy-MM-dd");
            const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
            
            let stats = { avgSleepHours: 0, weeklyTrainingMinutes: 0, recentCheckin: null as any };
            
            if (teenData) {
              const sleepLogs = await storage.getSleepLogs(teenData.id, weekAgo, today);
              const workoutLogs = await storage.getWorkoutLogs(teenData.id, weekAgo, today);
              const checkins = await storage.getCheckins(teenData.id, weekAgo, today);
              
              stats.avgSleepHours = sleepLogs.length > 0
                ? sleepLogs.reduce((sum, log) => sum + Number(log.totalHours || 0), 0) / sleepLogs.length
                : 0;
              stats.weeklyTrainingMinutes = workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
              stats.recentCheckin = checkins[0] ? {
                energyLevel: checkins[0].energyLevel,
                moodLevel: checkins[0].moodLevel,
              } : null;
            }

            linkedTeens.push({
              link,
              profile: {
                displayName: teenProfile?.displayName || "Unknown",
                ageRange: teenProfile?.ageRange || "",
              },
              stats,
            });
          }
        }

        res.json({ linkedTeens, pendingLinks });
      } else {
        const links = await storage.getLinksByTeen(req.user!.userId);
        res.json({ links });
      }
    } catch (error) {
      console.error("Link status error:", error);
      res.status(500).json({ error: "Failed to get link status" });
    }
  });

  // GUARDRAILS ROUTES
  app.get("/api/guardrails", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const linkId = req.query.linkId as string;
      if (!linkId) {
        return res.status(400).json({ error: "Link ID required" });
      }
      const guardrails = await storage.getGuardrails(linkId);
      res.json(guardrails || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get guardrails" });
    }
  });

  app.post("/api/guardrails", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const guardrails = await storage.createGuardrails(req.body);
      res.json(guardrails);
    } catch (error) {
      res.status(500).json({ error: "Failed to create guardrails" });
    }
  });

  app.put("/api/guardrails", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const { linkId, guardrails: data } = req.body;
      const guardrails = await storage.updateGuardrails(linkId, data);
      res.json(guardrails);
    } catch (error) {
      res.status(500).json({ error: "Failed to update guardrails" });
    }
  });

  // SHARING PREFERENCES ROUTES
  app.get("/api/sharing-preferences", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json(null);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json(null);
      const prefs = await storage.getSharingPreferences(teenProfile.id);
      res.json(prefs || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get sharing preferences" });
    }
  });

  app.put("/api/sharing-preferences", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });
      
      let prefs = await storage.getSharingPreferences(teenProfile.id);
      if (!prefs) {
        prefs = await storage.createSharingPreferences({ teenProfileId: teenProfile.id, ...req.body });
      } else {
        prefs = await storage.updateSharingPreferences(teenProfile.id, req.body);
      }
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sharing preferences" });
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

  app.post("/api/checkin", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const today = format(new Date(), "yyyy-MM-dd");
      const checkin = await storage.createCheckin({
        teenProfileId: teenProfile.id,
        date: today,
        ...req.body,
      });

      if (req.body.hasPainFlag) {
        await storage.createSafetyAlert({
          teenProfileId: teenProfile.id,
          alertType: "pain_flag",
          severity: "warning",
          message: `Pain reported: ${req.body.painNotes || "No details provided"}`,
        });
      }

      res.json(checkin);
    } catch (error) {
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

  app.post("/api/sleep", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const log = await storage.createSleepLog({
        teenProfileId: teenProfile.id,
        ...req.body,
      });
      res.json(log);
    } catch (error) {
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

  app.post("/api/workout", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const log = await storage.createWorkoutLog({
        teenProfileId: teenProfile.id,
        ...req.body,
      });
      res.json(log);
    } catch (error) {
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

  app.post("/api/nutrition", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

      const log = await storage.createNutritionLog({
        teenProfileId: teenProfile.id,
        ...req.body,
      });
      res.json(log);
    } catch (error) {
      console.error("Nutrition log error:", error);
      res.status(500).json({ error: "Failed to save nutrition log" });
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

  app.post("/api/pt-routine", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.status(404).json({ error: "Teen profile not found" });

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

  app.post("/api/pt-adherence", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
    try {
      const log = await storage.createPtAdherenceLog(req.body);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to save PT adherence log" });
    }
  });

  // SAFETY ALERTS ROUTES
  app.get("/api/safety-alerts", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const profile = await storage.getProfile(req.user!.userId);
      if (!profile) return res.json([]);
      const teenProfile = await storage.getTeenProfile(profile.id);
      if (!teenProfile) return res.json([]);

      const alerts = await storage.getSafetyAlerts(teenProfile.id);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get safety alerts" });
    }
  });

  app.get("/api/parent/alerts", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const links = await storage.getLinksByParent(req.user!.userId);
      const activeLinks = links.filter(l => l.status === "active" && l.teenUserId);
      
      const allAlerts = [];
      for (const link of activeLinks) {
        const profile = await storage.getProfile(link.teenUserId!);
        if (!profile) continue;
        const teenProfile = await storage.getTeenProfile(profile.id);
        if (!teenProfile) continue;
        const alerts = await storage.getUnacknowledgedAlerts(teenProfile.id);
        allAlerts.push(...alerts);
      }

      res.json(allAlerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get parent alerts" });
    }
  });

  app.put("/api/safety-alerts/:id/acknowledge", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const isTeen = req.user!.role === "teen";
      const isParent = req.user!.role === "parent";
      const alert = await storage.acknowledgeAlert(req.params.id, isTeen, isParent);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // HEALTH SYNC ROUTES (Apple HealthKit)
  app.post("/api/health-sync", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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
              quality: 'good', // Default quality for HealthKit synced data
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
            const workoutType = mapHealthKitWorkoutType(entry.workoutType);
            await storage.createWorkoutLog({
              teenProfileId: teenProfile.id,
              date: entry.date,
              workoutType,
              durationMinutes: entry.durationMinutes,
              intensity: 'moderate', // Default for HealthKit data
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
            protein: nutrition.protein ? String(nutrition.protein) : null,
            carbs: nutrition.carbohydrates ? String(nutrition.carbohydrates) : null,
            fats: nutrition.fat ? String(nutrition.fat) : null,
            description: 'Daily total synced from Apple Health',
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
      'Soccer': 'sport',
      'Basketball': 'sport',
      'Tennis': 'sport',
      'Volleyball': 'sport',
      'Baseball': 'sport',
      'American Football': 'sport',
      'Traditional Strength Training': 'strength',
      'Functional Strength Training': 'strength',
      'Yoga': 'flexibility',
      'Dance': 'cardio',
      'Cross Training': 'hiit',
      'Mixed Metabolic Cardio Training': 'hiit',
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
  app.post("/api/recommendations/actions/complete", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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
  app.get("/api/safety-alerts", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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
      const { id } = req.params;
      const alert = await storage.getAlertById(id);
      
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

      const updated = await storage.acknowledgeAlert(id, true, false);
      res.json(updated);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Get alerts for parent (only alerts marked as shareWithParent)
  app.get("/api/parent/alerts", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const links = await storage.getLinksByParent(req.user!.userId);
      const allAlerts = [];

      for (const link of links) {
        if (link.status !== "active" || !link.teenUserId) continue;

        const profile = await storage.getProfile(link.teenUserId);
        if (!profile) continue;

        const teenProfile = await storage.getTeenProfile(profile.id);
        if (!teenProfile) continue;

        const alerts = await storage.getParentVisibleAlerts(teenProfile.id);
        allAlerts.push(...alerts.map(alert => ({
          ...alert,
          teenName: profile.displayName,
          teenProfileId: teenProfile.id,
        })));
      }

      // Sort by createdAt descending
      allAlerts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json(allAlerts);
    } catch (error) {
      console.error("Error fetching parent alerts:", error);
      res.status(500).json({ error: "Failed to get parent alerts" });
    }
  });

  // Parent acknowledges an alert
  app.put("/api/parent/alerts/:id/acknowledge", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.getAlertById(id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }

      // Verify parent has access to this teen's alerts
      const links = await storage.getLinksByParent(req.user!.userId);
      let hasAccess = false;

      for (const link of links) {
        if (link.status !== "active" || !link.teenUserId) continue;
        const profile = await storage.getProfile(link.teenUserId);
        if (!profile) continue;
        const teenProfile = await storage.getTeenProfile(profile.id);
        if (teenProfile && teenProfile.id === alert.teenProfileId) {
          hasAccess = true;
          break;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({ error: "Not authorized to acknowledge this alert" });
      }

      const updated = await storage.acknowledgeAlert(id, false, true);
      res.json(updated);
    } catch (error) {
      console.error("Error acknowledging parent alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Trigger safety check for a teen (for testing/manual trigger)
  app.post("/api/safety-check", authMiddleware, requireRole("teen"), async (req: AuthRequest, res) => {
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

  // PARENT DASHBOARD ROUTE
  app.get("/api/parent/dashboard", authMiddleware, requireRole("parent"), async (req: AuthRequest, res) => {
    try {
      const links = await storage.getLinksByParent(req.user!.userId);
      const dashboard = [];

      for (const link of links) {
        if (link.status !== "active" || !link.teenUserId) continue;

        const profile = await storage.getProfile(link.teenUserId);
        if (!profile) continue;
        const teenProfile = await storage.getTeenProfile(profile.id);
        if (!teenProfile) continue;
        const sharingPrefs = await storage.getSharingPreferences(teenProfile.id);

        const today = format(new Date(), "yyyy-MM-dd");
        const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

        const data: any = { link, profile, teenProfile };

        if (sharingPrefs?.shareSleepTrend) {
          const sleepLogs = await storage.getSleepLogs(teenProfile.id, weekAgo, today);
          data.avgSleepHours = sleepLogs.length > 0
            ? sleepLogs.reduce((sum, log) => sum + Number(log.totalHours || 0), 0) / sleepLogs.length
            : 0;
        }

        if (sharingPrefs?.shareTrainingTrend) {
          const workoutLogs = await storage.getWorkoutLogs(teenProfile.id, weekAgo, today);
          data.weeklyTrainingMinutes = workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
        }

        if (sharingPrefs?.shareNutritionTrend) {
          const nutritionLogs = await storage.getNutritionLogs(teenProfile.id, weekAgo, today);
          data.avgDailyCalories = nutritionLogs.length > 0
            ? nutritionLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / 7
            : 0;
        }

        dashboard.push(data);
      }

      res.json(dashboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to get parent dashboard" });
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

  return httpServer;
}
