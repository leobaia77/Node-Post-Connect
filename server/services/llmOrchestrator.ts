import OpenAI from "openai";
import { db } from "../db";
import { recommendations, morningBriefs, teenProfiles, profiles } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { searchEvidence, formatEvidenceForLLM, getEvidenceById, type Evidence } from "./evidenceLibrary";

if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  console.warn("[LLMOrchestrator] AI Integrations not configured - recommendations will be unavailable");
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const SYSTEM_PROMPT = `You are a health and fitness guidance assistant for teenagers. Your role is to provide evidence-based, safe recommendations for sleep, nutrition, training, and recovery.

CRITICAL SAFETY RULES - YOU MUST NEVER:
1. Suggest extreme calorie restriction or any form of restrictive dieting
2. Recommend fasting for minors
3. Suggest supplements, diet pills, or performance-enhancing substances
4. Encourage weight loss as a goal for teens
5. Provide advice that could promote eating disorders
6. Suggest unsafe training loads or exercises beyond the teen's level
7. Use body-shaming or appearance-focused language
8. Claim to diagnose or treat medical conditions
9. Suggest the teen hide anything from parents/guardians
10. Override parent-set guardrails under any circumstances

SCOLIOSIS-SPECIFIC SAFETY RULES (when teen has scoliosis):
- Never suggest changing or skipping prescribed PT exercises without consulting their PT
- Never recommend reducing brace wear time below prescribed hours
- Never suggest any exercises that could harm their spine without PT approval
- Always encourage following their orthotist's and PT's instructions
- For red flag symptoms (numbness, weakness, bladder issues), escalate urgency to "immediate"
- Be supportive about brace wear challenges without suggesting reduction in wear time
- Acknowledge that scoliosis management takes consistency and patience

IMPORTANT GUIDANCE PRINCIPLES:
- All recommendations must cite evidence from the provided evidence library
- Frame everything positively (what TO do, not what NOT to do)
- Emphasize health, energy, and performance over appearance
- Respect the teen's selected goals and priorities
- Consider the full context (schedule, recovery status, upcoming events)
- When in doubt, recommend rest/recovery over more training
- Always recommend consulting a healthcare provider for medical concerns
- For scoliosis support: emphasize adherence to prescribed PT and brace schedule, celebrate progress

OUTPUT FORMAT: You must respond with valid JSON only, no markdown or explanation.`;

export interface TodayAction {
  id: string;
  category: "nutrition" | "training" | "sleep" | "recovery" | "pt";
  priority: "high" | "medium" | "low";
  action: string;
  detail?: string;
  timing?: string | null;
  evidence_ids: string[];
  why: string;
}

export interface WeekFocus {
  theme: string;
  key_points: string[];
  evidence_ids: string[];
}

export interface NutritionGuidance {
  protein_target_range?: string;
  focus_foods?: string[];
  pre_practice_suggestion?: string;
  post_practice_suggestion?: string;
  hydration_reminder?: string;
  evidence_ids: string[];
}

export interface TrainingGuidance {
  recommended_volume_today: "moderate" | "light" | "rest" | "full";
  specific_suggestions: string[];
  cautions: string[];
  evidence_ids: string[];
}

export interface SleepGuidance {
  target_bedtime?: string;
  target_wake?: string;
  wind_down_suggestion?: string;
  evidence_ids: string[];
}

export interface EscalationFlag {
  type: "consult_professional";
  reason: string;
  urgency: "soon" | "urgent" | "immediate";
}

export interface Recommendations {
  date: string;
  today_actions: TodayAction[];
  week_focus: WeekFocus;
  nutrition_guidance: NutritionGuidance;
  training_guidance: TrainingGuidance;
  sleep_guidance: SleepGuidance;
  escalation_flags: EscalationFlag[];
  confidence_notes: string;
}

export interface MorningBrief {
  teenProfileId: string;
  date: string;
  goals: string[];
  sports: { name: string; level: string }[];
  recentSleep: { date: string; hours: number }[];
  recentWorkouts: { date: string; type: string; durationMinutes: number; rpe?: number }[];
  recentCheckins: { date: string; energy: number; soreness: number; mood: number; stress: number; hasPain: boolean }[];
  recentNutrition: { date: string; totalCalories: number; totalProtein: number }[];
  upcomingSchedule?: { date: string; activities: string[] }[];
  hasScoliosis?: boolean;
  ptAdherence?: { completed: number; total: number };
  braceWear?: { targetHours: number; recentDays: { date: string; hoursWorn: number }[] };
  scoliosisSymptoms?: { date: string; discomfortLevel: number; hasRedFlags: boolean }[];
}

export interface ValidationResult {
  valid: boolean;
  blocked_items: { action_id: string; reason: string }[];
  warnings: string[];
}

const PROHIBITED_KEYWORDS = [
  "diet pill", "diet pills", "fat burner", "weight loss pill",
  "fasting", "fast for", "skip meals", "restrictive diet",
  "lose weight", "drop pounds", "shed weight", "burn fat",
  "skinny", "thin", "slim down", "get lean",
  "supplement", "creatine", "pre-workout", "caffeine pill",
  "laxative", "diuretic", "ephedra", "steroids",
  "hide from parents", "don't tell", "keep secret"
];

function containsProhibitedContent(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const keyword of PROHIBITED_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

function validateEvidenceIds(ids: string[], section: string, warnings: string[]): string[] {
  const validIds: string[] = [];
  for (const id of ids) {
    if (getEvidenceById(id)) {
      validIds.push(id);
    } else {
      warnings.push(`${section} references unknown evidence: ${id}`);
    }
  }
  return validIds;
}

export function validateRecommendations(recs: Recommendations): ValidationResult {
  const blocked_items: { action_id: string; reason: string }[] = [];
  const warnings: string[] = [];
  let hasBlockedContent = false;

  for (const action of recs.today_actions) {
    const actionText = `${action.action} ${action.detail || ""} ${action.why}`;
    const prohibited = containsProhibitedContent(actionText);
    
    if (prohibited) {
      blocked_items.push({
        action_id: action.id,
        reason: `Contains prohibited content: "${prohibited}"`
      });
    }

    action.evidence_ids = validateEvidenceIds(action.evidence_ids, `Action ${action.id}`, warnings);
  }

  const nutritionText = JSON.stringify(recs.nutrition_guidance);
  const nutritionProhibited = containsProhibitedContent(nutritionText);
  if (nutritionProhibited) {
    hasBlockedContent = true;
    recs.nutrition_guidance = {
      evidence_ids: [],
      hydration_reminder: "Stay hydrated throughout the day."
    };
    warnings.push(`Nutrition guidance blocked due to prohibited content`);
  } else if (recs.nutrition_guidance.evidence_ids) {
    recs.nutrition_guidance.evidence_ids = validateEvidenceIds(
      recs.nutrition_guidance.evidence_ids, "Nutrition guidance", warnings
    );
  }

  const trainingText = JSON.stringify(recs.training_guidance);
  const trainingProhibited = containsProhibitedContent(trainingText);
  if (trainingProhibited) {
    hasBlockedContent = true;
    recs.training_guidance = {
      recommended_volume_today: "moderate",
      specific_suggestions: [],
      cautions: [],
      evidence_ids: []
    };
    warnings.push(`Training guidance blocked due to prohibited content`);
  } else if (recs.training_guidance.evidence_ids) {
    recs.training_guidance.evidence_ids = validateEvidenceIds(
      recs.training_guidance.evidence_ids, "Training guidance", warnings
    );
  }

  const sleepText = JSON.stringify(recs.sleep_guidance);
  const sleepProhibited = containsProhibitedContent(sleepText);
  if (sleepProhibited) {
    hasBlockedContent = true;
    recs.sleep_guidance = {
      target_bedtime: "22:00",
      target_wake: "07:00",
      evidence_ids: []
    };
    warnings.push(`Sleep guidance blocked due to prohibited content`);
  } else if (recs.sleep_guidance.evidence_ids) {
    recs.sleep_guidance.evidence_ids = validateEvidenceIds(
      recs.sleep_guidance.evidence_ids, "Sleep guidance", warnings
    );
  }

  if (recs.week_focus) {
    const weekFocusText = JSON.stringify(recs.week_focus);
    const weekFocusProhibited = containsProhibitedContent(weekFocusText);
    if (weekFocusProhibited) {
      hasBlockedContent = true;
      recs.week_focus = {
        theme: "Focus on consistent healthy habits",
        key_points: ["Get adequate sleep", "Stay active", "Eat balanced meals"],
        evidence_ids: []
      };
      warnings.push(`Week focus blocked due to prohibited content`);
    } else if (recs.week_focus.evidence_ids) {
      recs.week_focus.evidence_ids = validateEvidenceIds(
        recs.week_focus.evidence_ids, "Week focus", warnings
      );
    }
  }

  if (recs.escalation_flags) {
    recs.escalation_flags = recs.escalation_flags.filter(flag => {
      const flagText = `${flag.reason} ${flag.type}`;
      const prohibited = containsProhibitedContent(flagText);
      if (prohibited) {
        warnings.push(`Escalation flag blocked due to prohibited content`);
        return false;
      }
      return true;
    });
  }

  return {
    valid: blocked_items.length === 0 && !hasBlockedContent,
    blocked_items,
    warnings
  };
}

function buildPromptContext(brief: MorningBrief, evidence: Evidence[]): string {
  const evidenceContext = formatEvidenceForLLM(evidence);
  
  const avgSleep = brief.recentSleep.length > 0
    ? (brief.recentSleep.reduce((sum, s) => sum + s.hours, 0) / brief.recentSleep.length).toFixed(1)
    : "unknown";

  const avgEnergy = brief.recentCheckins.length > 0
    ? (brief.recentCheckins.reduce((sum, c) => sum + c.energy, 0) / brief.recentCheckins.length).toFixed(1)
    : "unknown";

  const hasPainRecently = brief.recentCheckins.some(c => c.hasPain);
  const avgStress = brief.recentCheckins.length > 0
    ? (brief.recentCheckins.reduce((sum, c) => sum + c.stress, 0) / brief.recentCheckins.length).toFixed(1)
    : "unknown";

  const totalTrainingMinutes = brief.recentWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const trainingDays = brief.recentWorkouts.length;

  const braceInfo = brief.braceWear 
    ? `- Brace target: ${brief.braceWear.targetHours} hours/day, Recent: ${brief.braceWear.recentDays.map(d => `${d.date}: ${d.hoursWorn.toFixed(1)}h`).join(", ") || "No data"}`
    : "";

  const symptomInfo = brief.scoliosisSymptoms && brief.scoliosisSymptoms.length > 0
    ? `- Recent symptoms: ${brief.scoliosisSymptoms.map(s => `${s.date}: Level ${s.discomfortLevel}/4${s.hasRedFlags ? " [RED FLAGS]" : ""}`).join(", ")}`
    : "";

  return `
TEEN PROFILE:
- Goals: ${brief.goals.join(", ") || "Not specified"}
- Sports: ${brief.sports.map(s => `${s.name} (${s.level})`).join(", ") || "None specified"}
${brief.hasScoliosis ? "- Has scoliosis - PT exercises and brace prescribed" : ""}
${brief.ptAdherence ? `- PT adherence: ${brief.ptAdherence.completed}/${brief.ptAdherence.total} sessions completed` : ""}
${braceInfo}
${symptomInfo}

RECENT DATA SUMMARY (last 7 days):
- Average sleep: ${avgSleep} hours/night
- Average energy level: ${avgEnergy}/10
- Average stress level: ${avgStress}/10
- Pain reported: ${hasPainRecently ? "Yes - recently" : "No"}
- Training: ${totalTrainingMinutes} minutes across ${trainingDays} days

DETAILED SLEEP LOG:
${brief.recentSleep.map(s => `  ${s.date}: ${s.hours} hours`).join("\n") || "  No data"}

DETAILED WORKOUT LOG:
${brief.recentWorkouts.map(w => `  ${w.date}: ${w.type} - ${w.durationMinutes} min${w.rpe ? ` (RPE: ${w.rpe})` : ""}`).join("\n") || "  No data"}

DETAILED CHECK-IN LOG:
${brief.recentCheckins.map(c => `  ${c.date}: Energy ${c.energy}/10, Soreness ${c.soreness}/10, Mood ${c.mood}/10, Stress ${c.stress}/10${c.hasPain ? " [PAIN FLAGGED]" : ""}`).join("\n") || "  No data"}

NUTRITION LOG:
${brief.recentNutrition.map(n => `  ${n.date}: ${n.totalCalories} cal, ${n.totalProtein}g protein`).join("\n") || "  No data"}

${brief.upcomingSchedule ? `UPCOMING SCHEDULE:\n${brief.upcomingSchedule.map(s => `  ${s.date}: ${s.activities.join(", ")}`).join("\n")}` : ""}

TODAY'S DATE: ${brief.date}

EVIDENCE LIBRARY (cite evidence_ids in your recommendations):
${evidenceContext}

Generate personalized recommendations for today based on this teen's data and goals. Return valid JSON matching this schema:
{
  "date": "YYYY-MM-DD",
  "today_actions": [
    {
      "id": "action-001",
      "category": "nutrition" | "training" | "sleep" | "recovery" | "pt",
      "priority": "high" | "medium" | "low",
      "action": "Brief action text (max 100 chars)",
      "detail": "Longer explanation if needed",
      "timing": "at lunch" | "before practice" | "before bed" | null,
      "evidence_ids": ["evidence-id"],
      "why": "Brief rationale connecting to their goals"
    }
  ],
  "week_focus": {
    "theme": "Theme for the week",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "evidence_ids": ["evidence-id"]
  },
  "nutrition_guidance": {
    "protein_target_range": "75-90g",
    "focus_foods": ["lean meats", "dairy", "legumes"],
    "pre_practice_suggestion": "Light snack with carbs 1-2 hours before",
    "post_practice_suggestion": "Protein + carbs within 30-60 minutes",
    "hydration_reminder": "Aim for 8+ cups of water, more on training days",
    "evidence_ids": ["evidence-id"]
  },
  "training_guidance": {
    "recommended_volume_today": "moderate" | "light" | "rest" | "full",
    "specific_suggestions": ["Suggestion 1", "Suggestion 2"],
    "cautions": ["Caution 1"],
    "evidence_ids": ["evidence-id"]
  },
  "sleep_guidance": {
    "target_bedtime": "22:30",
    "target_wake": "07:00",
    "wind_down_suggestion": "Start winding down at 22:00, limit screens",
    "evidence_ids": ["evidence-id"]
  },
  "escalation_flags": [
    {
      "type": "consult_professional",
      "reason": "Reason for flag",
      "urgency": "soon" | "urgent" | "immediate"
    }
  ],
  "confidence_notes": "Notes about confidence level"
}`;
}

export async function generateRecommendations(brief: MorningBrief): Promise<Recommendations> {
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    throw new Error("AI Integrations not configured - recommendations unavailable");
  }

  const relevantEvidence = searchEvidence({
    goals: brief.goals,
    categories: ["sleep", "nutrition", "training", "bone_health", ...(brief.hasScoliosis ? ["scoliosis"] : [])]
  });

  const prompt = buildPromptContext(brief, relevantEvidence);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from LLM");
  }

  let recs: Recommendations;
  try {
    recs = JSON.parse(content) as Recommendations;
  } catch (error) {
    throw new Error(`Failed to parse LLM response as JSON: ${error}`);
  }

  const validation = validateRecommendations(recs);
  
  if (!validation.valid) {
    recs.today_actions = recs.today_actions.filter(
      action => !validation.blocked_items.some(b => b.action_id === action.id)
    );
  }

  if (validation.warnings.length > 0) {
    recs.confidence_notes = `${recs.confidence_notes || ""} [Validation warnings: ${validation.warnings.join("; ")}]`;
  }

  return recs;
}

export async function getOrGenerateRecommendations(
  teenProfileId: string,
  date: string
): Promise<Recommendations | null> {
  const existingBrief = await db
    .select()
    .from(morningBriefs)
    .where(and(
      eq(morningBriefs.teenProfileId, teenProfileId),
      eq(morningBriefs.date, date)
    ))
    .limit(1);

  if (!existingBrief[0]) {
    return null;
  }

  const existingRec = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.morningBriefId, existingBrief[0].id))
    .limit(1);

  if (existingRec[0]) {
    return existingRec[0].recommendationsJson as unknown as Recommendations;
  }

  const briefData = existingBrief[0].briefJson as unknown as MorningBrief;
  briefData.teenProfileId = teenProfileId;
  briefData.date = date;

  const recs = await generateRecommendations(briefData);

  await db.insert(recommendations).values({
    morningBriefId: existingBrief[0].id,
    recommendationsJson: recs as unknown as Record<string, unknown>
  });

  return recs;
}

export async function buildMorningBrief(teenProfileId: string, date: string): Promise<MorningBrief> {
  const { dailyCheckins, sleepLogs, workoutLogs, nutritionLogs, ptRoutines, ptAdherenceLogs, braceSchedules, braceWearingLogs, scoliosisSymptomLogs } = await import("@shared/schema");
  const { gte, lte, desc } = await import("drizzle-orm");
  
  const endDate = new Date(date);
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 7);
  const startDateStr = startDate.toISOString().split("T")[0];

  const teenProfile = await db
    .select()
    .from(teenProfiles)
    .where(eq(teenProfiles.id, teenProfileId))
    .limit(1);

  if (!teenProfile[0]) {
    throw new Error("Teen profile not found");
  }

  const recentSleep = await db
    .select()
    .from(sleepLogs)
    .where(and(
      eq(sleepLogs.teenProfileId, teenProfileId),
      gte(sleepLogs.date, startDateStr),
      lte(sleepLogs.date, date)
    ))
    .orderBy(desc(sleepLogs.date));

  const recentWorkouts = await db
    .select()
    .from(workoutLogs)
    .where(and(
      eq(workoutLogs.teenProfileId, teenProfileId),
      gte(workoutLogs.date, startDateStr),
      lte(workoutLogs.date, date)
    ))
    .orderBy(desc(workoutLogs.date));

  const recentCheckins = await db
    .select()
    .from(dailyCheckins)
    .where(and(
      eq(dailyCheckins.teenProfileId, teenProfileId),
      gte(dailyCheckins.date, startDateStr),
      lte(dailyCheckins.date, date)
    ))
    .orderBy(desc(dailyCheckins.date));

  const recentNutrition = await db
    .select()
    .from(nutritionLogs)
    .where(and(
      eq(nutritionLogs.teenProfileId, teenProfileId),
      gte(nutritionLogs.date, startDateStr),
      lte(nutritionLogs.date, date)
    ))
    .orderBy(desc(nutritionLogs.date));

  const routines = await db
    .select()
    .from(ptRoutines)
    .where(eq(ptRoutines.teenProfileId, teenProfileId));

  let ptAdherence: { completed: number; total: number } | undefined;
  if (routines.length > 0) {
    const adherenceLogs = await db
      .select()
      .from(ptAdherenceLogs)
      .where(and(
        eq(ptAdherenceLogs.routineId, routines[0].id),
        gte(ptAdherenceLogs.date, startDateStr),
        lte(ptAdherenceLogs.date, date)
      ));
    
    ptAdherence = {
      completed: adherenceLogs.filter(l => l.completed).length,
      total: adherenceLogs.length
    };
  }

  const braceSchedule = await db
    .select()
    .from(braceSchedules)
    .where(and(
      eq(braceSchedules.teenProfileId, teenProfileId),
      eq(braceSchedules.isActive, true)
    ))
    .limit(1);

  let braceWear: { targetHours: number; recentDays: { date: string; hoursWorn: number }[] } | undefined;
  if (braceSchedule.length > 0) {
    const recentBraceLogs = await db
      .select()
      .from(braceWearingLogs)
      .where(and(
        eq(braceWearingLogs.teenProfileId, teenProfileId),
        gte(braceWearingLogs.date, startDateStr),
        lte(braceWearingLogs.date, date)
      ))
      .orderBy(desc(braceWearingLogs.date));

    const braceByDate = new Map<string, number>();
    for (const log of recentBraceLogs) {
      if (log.durationMinutes) {
        const existing = braceByDate.get(log.date) || 0;
        braceByDate.set(log.date, existing + log.durationMinutes);
      }
    }

    braceWear = {
      targetHours: braceSchedule[0].dailyTargetHours || 16,
      recentDays: Array.from(braceByDate.entries()).map(([d, mins]) => ({
        date: d,
        hoursWorn: mins / 60
      }))
    };
  }

  const recentSymptoms = await db
    .select()
    .from(scoliosisSymptomLogs)
    .where(and(
      eq(scoliosisSymptomLogs.teenProfileId, teenProfileId),
      gte(scoliosisSymptomLogs.date, startDateStr),
      lte(scoliosisSymptomLogs.date, date)
    ))
    .orderBy(desc(scoliosisSymptomLogs.date));

  const scoliosisSymptoms = recentSymptoms.map(s => ({
    date: s.date,
    discomfortLevel: s.curveDiscomfortLevel || 0,
    hasRedFlags: ((s.redFlags as string[]) || []).length > 0
  }));

  const nutritionByDate = new Map<string, { calories: number; protein: number }>();
  for (const log of recentNutrition) {
    const existing = nutritionByDate.get(log.date) || { calories: 0, protein: 0 };
    existing.calories += log.calories || 0;
    existing.protein += parseFloat(log.proteinG?.toString() || "0");
    nutritionByDate.set(log.date, existing);
  }

  return {
    teenProfileId,
    date,
    goals: (teenProfile[0].goals as string[]) || [],
    sports: (teenProfile[0].sports as { name: string; level: string }[]) || [],
    recentSleep: recentSleep.map(s => ({
      date: s.date,
      hours: parseFloat(s.totalHours?.toString() || "0")
    })),
    recentWorkouts: recentWorkouts.map(w => ({
      date: w.date,
      type: w.workoutType,
      durationMinutes: w.durationMinutes,
      rpe: w.rpe || undefined
    })),
    recentCheckins: recentCheckins.map(c => ({
      date: c.date,
      energy: c.energyLevel,
      soreness: c.sorenessLevel,
      mood: c.moodLevel,
      stress: c.stressLevel,
      hasPain: c.hasPainFlag || false
    })),
    recentNutrition: Array.from(nutritionByDate.entries()).map(([d, n]) => ({
      date: d,
      totalCalories: n.calories,
      totalProtein: n.protein
    })),
    hasScoliosis: routines.length > 0 || braceSchedule.length > 0,
    ptAdherence,
    braceWear,
    scoliosisSymptoms: scoliosisSymptoms.length > 0 ? scoliosisSymptoms : undefined
  };
}
