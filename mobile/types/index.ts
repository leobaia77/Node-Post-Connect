export type UserRole = 'teen' | 'parent' | 'admin';

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  onboardingComplete: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TeenProfile {
  id: number;
  userId: number;
  ageRange: string | null;
  goals: Goal[];
  sports: Sport[];
  weeklyAvailability: WeeklyAvailability | null;
  healthConnected: boolean;
  linkedParentId: number | null;
}

export interface Goal {
  id: string;
  name: string;
  priority: number;
}

export interface Sport {
  id: string;
  name: string;
  level: 'recreational' | 'school' | 'club' | 'elite';
}

export interface WeeklyAvailability {
  monday: TimeBlock[];
  tuesday: TimeBlock[];
  wednesday: TimeBlock[];
  thursday: TimeBlock[];
  friday: TimeBlock[];
  saturday: TimeBlock[];
  sunday: TimeBlock[];
}

export interface TimeBlock {
  start: string;
  end: string;
  activity?: string;
}

export interface ParentProfile {
  id: number;
  userId: number;
  inviteCode: string | null;
}

export interface ParentTeenLink {
  id: number;
  parentId: number;
  teenId: number;
  status: 'pending' | 'active' | 'revoked';
  supervisionLevel: 'light' | 'moderate' | 'full';
}

export interface ParentGuardrails {
  id: number;
  parentId: number;
  teenId: number;
  maxWeeklyTrainingMinutes: number | null;
  minNightlySleepHours: number | null;
  noWeightLossMode: boolean;
}

export interface DailyCheckin {
  id: number;
  teenId: number;
  date: string;
  energyLevel: number;
  sorenessLevel: number;
  moodLevel: number;
  stressLevel: number;
  painFlag: boolean;
  painNotes: string | null;
}

export interface SleepLog {
  id: number;
  teenId: number;
  date: string;
  totalHours: string;
  source: string;
}

export interface WorkoutLog {
  id: number;
  teenId: number;
  date: string;
  workoutType: string;
  durationMinutes: number;
  rpe: number | null;
  notes: string | null;
  source: string;
}

export interface NutritionLog {
  id: number;
  teenId: number;
  date: string;
  mealType: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  source: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface RecommendationAction {
  id: string;
  category: 'nutrition' | 'training' | 'sleep' | 'recovery' | 'pt';
  priority: 'high' | 'medium' | 'low';
  action: string;
  timing?: string;
  evidence_ids: string[];
  why: string;
}

export interface WeekFocus {
  theme: string;
  key_points: string[];
  evidence_ids: string[];
}

export interface NutritionGuidance {
  protein_target_range: string;
  focus_foods: string[];
  meal_timing_notes: string;
  hydration_target: string;
}

export interface TrainingGuidance {
  recommended_volume_today: 'rest' | 'light' | 'moderate' | 'full';
  cautions: string[];
  recovery_suggestions: string[];
}

export interface SleepGuidance {
  target_bedtime: string;
  target_wake: string;
  wind_down_suggestions: string[];
}

export interface EscalationFlag {
  type: 'consult_professional' | 'parent_notification' | 'urgent_concern';
  reason: string;
  urgency: 'immediate' | 'soon' | 'routine';
}

export interface Recommendations {
  date: string;
  today_actions: RecommendationAction[];
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
  sleep_summary: {
    avg_hours: number;
    trend: 'improving' | 'declining' | 'stable';
    nights_logged: number;
  };
  training_summary: {
    total_minutes_7d: number;
    sessions: number;
    load_trend: 'increasing' | 'decreasing' | 'stable';
  };
  nutrition_summary: {
    meals_logged_7d: number;
    avg_protein: number | null;
    completeness: 'full' | 'partial' | 'minimal';
  };
  checkin_summary: {
    avg_energy: number | null;
    avg_soreness: number | null;
    avg_mood: number | null;
    avg_stress: number | null;
    pain_flags: number;
    days_logged: number;
  };
  pt_summary: {
    has_routine: boolean;
    recent_adherence_percent: number | null;
  };
  active_goals: Array<{ id: string; name: string; priority: number }>;
  active_sports: Array<{ id: string; name: string; level: string }>;
}
