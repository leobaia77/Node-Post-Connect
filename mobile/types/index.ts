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
