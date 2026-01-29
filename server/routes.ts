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

  return httpServer;
}
