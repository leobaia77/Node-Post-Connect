# GrowthTrack Frontend Integration Guide

## Architecture Overview

GrowthTrack is a **mobile-only health tracking application** with:
- **Backend API**: Express.js + TypeScript running on Replit (published as web service)
- **Mobile App**: React Native + Expo (runs in separate Replit project)
- **Database**: PostgreSQL with Drizzle ORM

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token + user object
3. Mobile stores token in `expo-secure-store`
4. All authenticated requests include `Authorization: Bearer <token>` header

---

## User Roles

| Role | Description |
|------|-------------|
| `user` | Standard user with health tracking features |
| `admin` | Administrator with elevated permissions |

**Note**: Registration defaults to `user` role. No role selection in UI.

---

## API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create new account |
| `/api/auth/login` | POST | No | Login existing user |
| `/api/auth/me` | GET | Yes | Get current user info |

#### Register Request/Response
```typescript
// Request
{
  email: string;
  password: string;
  displayName: string;
  role?: "user" | "admin"; // defaults to "user"
}

// Response
{
  token: string;
  user: {
    id: string;           // UUID
    email: string;
    role: "user" | "admin";
    createdAt: string;
    updatedAt: string;
  };
  profile: {
    id: string;
    userId: string;
    displayName: string;
    ageRange: string | null;
    timezone: string;
    pushToken: string | null;
  };
  userProfile: {
    id: string;           // This is the "teenProfileId" used in health logs
    profileId: string;
    goals: string[];
    goalWeights: object;
    sports: object[];
    weeklyAvailability: object;
    hasScoliosisSupport: boolean;
  };
}
```

#### Login Request/Response
```typescript
// Request
{ email: string; password: string; }

// Response
{
  token: string;
  user: {
    id: string;
    email: string;
    role: "user" | "admin";
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### Profile Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/profile` | GET | Yes | Get user profile |
| `/api/profile` | PUT | Yes | Update user profile |
| `/api/user-profile` | GET | Yes | Get health tracking profile |
| `/api/user-profile` | PUT | Yes | Update health tracking profile |
| `/api/goals` | PUT | Yes | Update user goals |

---

### Health Logging Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/checkin` | POST | Yes | Create daily check-in |
| `/api/checkin` | GET | Yes | Get check-ins (query: startDate, endDate) |
| `/api/sleep` | POST | Yes | Log sleep entry |
| `/api/sleep` | GET | Yes | Get sleep logs |
| `/api/workout` | POST | Yes | Log workout |
| `/api/workout` | GET | Yes | Get workout logs |
| `/api/nutrition` | POST | Yes | Log meal/nutrition |
| `/api/nutrition` | GET | Yes | Get nutrition logs |

#### Daily Check-in Schema
```typescript
{
  date: string;           // "YYYY-MM-DD"
  energyLevel: number;    // 1-10
  sorenessLevel: number;  // 1-10
  moodLevel: number;      // 1-10
  stressLevel: number;    // 1-10
  painFlag: boolean;
  painNotes?: string;
}
```

#### Sleep Log Schema
```typescript
{
  date: string;           // "YYYY-MM-DD"
  totalHours: string;     // e.g., "8.5"
  bedtime?: string;       // "HH:MM"
  wakeTime?: string;      // "HH:MM"
  quality?: "poor" | "fair" | "good" | "excellent";
}
```

#### Workout Log Schema
```typescript
{
  date: string;
  workoutType: string;
  durationMinutes: number;
  rpe?: number;           // Rate of Perceived Exertion 1-10
  notes?: string;
  source?: string;        // "manual" | "healthkit"
}
```

#### Nutrition Log Schema
```typescript
{
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
```

---

### Scoliosis Support Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/scoliosis/exercises` | GET | Yes | Get all PT exercises |
| `/api/pt-routines` | GET | Yes | Get user's PT routines |
| `/api/pt-routines` | POST | Yes | Create PT routine |
| `/api/pt-routines/:id` | PUT | Yes | Update PT routine |
| `/api/pt-adherence` | POST | Yes | Log PT session |
| `/api/pt-adherence/:routineId` | GET | Yes | Get adherence logs |
| `/api/brace-schedules` | GET | Yes | Get brace schedule |
| `/api/brace-schedules` | POST | Yes | Create brace schedule |
| `/api/brace-logs` | POST | Yes | Log brace wearing session |
| `/api/brace-logs` | GET | Yes | Get brace logs |
| `/api/scoliosis-symptoms` | POST | Yes | Log symptom |
| `/api/scoliosis-symptoms` | GET | Yes | Get symptom logs |

---

### Safety Alerts

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/safety-alerts` | GET | Yes | Get user's alerts |
| `/api/safety-alerts/:id/acknowledge` | PUT | Yes | Acknowledge alert |
| `/api/safety-check` | POST | Yes | Trigger safety check |

---

### AI Recommendations

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/recommendations` | GET | Yes | Get AI recommendations |
| `/api/morning-brief` | GET | Yes | Get morning brief summary |

---

### Data Management

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/export-data` | GET | Yes | Export all user data (query: format=json|csv) |
| `/api/account` | DELETE | Yes | Delete account (body: { confirmEmail }) |

---

### HealthKit Sync

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health-sync` | POST | Yes | Sync HealthKit data |

```typescript
// Request body
{
  sleep?: Array<{ date: string; totalHours: number; bedtime?: string; wakeTime?: string }>;
  workouts?: Array<{ date: string; type: string; durationMinutes: number; calories?: number }>;
  activity?: Array<{ date: string; steps?: number; activeCalories?: number }>;
  nutrition?: Array<{ date: string; calories?: number; protein?: number }>;
}
```

---

## Data Model Field Mappings

### Critical ID Mappings

| Frontend Type | Backend Field | Description |
|---------------|---------------|-------------|
| `userId` | `users.id` | User's UUID |
| `profileId` | `profiles.id` | Profile UUID |
| `userProfileId` / `teenProfileId` | `teen_profiles.id` | Health tracking profile UUID |

**Important**: The backend uses `teenProfileId` in database tables and API responses for historical reasons. This refers to the user's health tracking profile.

### Table Prefix Mapping

| Database Table | Purpose |
|----------------|---------|
| `users` | User accounts |
| `profiles` | Basic profile info |
| `teen_profiles` | Health tracking profiles (for all users, not just teens) |
| `daily_checkins` | Daily health check-ins |
| `sleep_logs` | Sleep tracking |
| `workout_logs` | Exercise tracking |
| `nutrition_logs` | Meal tracking |
| `pt_routines` | Physical therapy routines |
| `pt_exercises` | Exercise definitions |
| `pt_routine_exercises` | Junction table |
| `pt_adherence_logs` | PT completion tracking |
| `brace_schedules` | Brace wearing schedules |
| `brace_wearing_logs` | Brace session logs |
| `symptom_logs` | Scoliosis symptom tracking |
| `safety_alerts` | Health safety alerts |
| `morning_briefs` | AI-generated daily briefs |
| `recommendations` | AI recommendations |

---

## Mobile App Route Structure

```
mobile/app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (onboarding)/
│   ├── age-range.tsx
│   ├── goals.tsx
│   ├── sports.tsx
│   ├── availability.tsx
│   └── connect-health.tsx
├── (app)/
│   ├── home.tsx
│   ├── log/
│   │   ├── index.tsx
│   │   ├── checkin.tsx
│   │   ├── meal-log.tsx
│   │   ├── workout-log.tsx
│   │   └── pt-log.tsx
│   ├── scoliosis/
│   │   ├── index.tsx
│   │   ├── pt-routine.tsx
│   │   ├── brace-tracker.tsx
│   │   ├── symptom-log.tsx
│   │   └── resources.tsx
│   ├── insights/
│   │   └── index.tsx
│   ├── plan/
│   │   └── index.tsx
│   └── settings/
│       ├── index.tsx
│       ├── goals.tsx
│       ├── notifications.tsx
│       ├── connections.tsx
│       ├── data-export.tsx
│       ├── account.tsx
│       ├── privacy-policy.tsx
│       └── terms.tsx
├── (tabs)/
│   └── profile.tsx
└── index.tsx
```

---

## TypeScript Types (Mobile)

```typescript
// User Types
export type UserRole = 'user' | 'admin';

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

export interface UserProfile {
  id: number;
  userId: number;
  ageRange: string | null;
  goals: Goal[];
  sports: Sport[];
  weeklyAvailability: WeeklyAvailability | null;
  healthConnected: boolean;
}

// Health Log Types
export interface DailyCheckin {
  id: number;
  teenId: number;  // Maps to teenProfileId on backend
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
  teenId: number;  // Maps to teenProfileId on backend
  date: string;
  totalHours: string;
  source: string;
}

export interface WorkoutLog {
  id: number;
  teenId: number;  // Maps to teenProfileId on backend
  date: string;
  workoutType: string;
  durationMinutes: number;
  rpe: number | null;
  notes: string | null;
  source: string;
}

export interface NutritionLog {
  id: number;
  teenId: number;  // Maps to teenProfileId on backend
  date: string;
  mealType: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  source: string;
}
```

---

## Environment Configuration

### Backend (This Project)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - JWT signing secret

### Mobile App (Separate Project)
- `EXPO_PUBLIC_API_URL` - Backend URL (e.g., `https://your-project.replit.app`)

---

## Key Integration Notes

1. **All authenticated endpoints require Bearer token** in Authorization header
2. **Dates use ISO format** ("YYYY-MM-DD" for dates, ISO 8601 for timestamps)
3. **Backend field `teenProfileId`** = User's health tracking profile ID (for all users)
4. **Push notifications** use Expo Push API - store pushToken in profile
5. **HealthKit sync** only available on iOS devices
6. **Role-based access**: Most endpoints require `user` role via `requireRole("user")` middleware
