# GrowthTrack - Teen Health Tracking App

## Overview

GrowthTrack is a teen health tracking application with parent oversight capabilities. The app enables teen athletes to log and monitor their health metrics (sleep, workouts, nutrition, daily check-ins) while allowing parents to maintain appropriate supervision through configurable guardrails and sharing preferences.

**Important Compliance Note:** Health data is NOT used for advertising - this is an Apple HealthKit requirement. All health data is stored securely and only shared according to user preferences.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight React router)
- **State Management:** TanStack React Query for server state
- **UI Components:** shadcn/ui component library with Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool:** Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework:** Express.js with TypeScript
- **Authentication:** JWT-based token authentication with bcryptjs password hashing
- **API Pattern:** RESTful API endpoints under `/api` prefix
- **Build:** esbuild for production bundling with selective dependency bundling for cold start optimization

### Database Layer
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (shared between client and server)
- **Migrations:** Drizzle Kit with `db:push` command
- **Connection:** Node-postgres (pg) pool

### Key Data Models
1. **Users & Profiles:** Role-based (teen, parent, admin) with separate profile tables
2. **Teen Profiles:** Goals, sports, weekly availability stored as JSONB
3. **Parent-Teen Links:** Invite code system with supervision levels and status tracking
4. **Parent Guardrails:** Configurable limits (training minutes, sleep hours, weight loss restrictions)
5. **Health Logs:** Daily check-ins, sleep logs, workout logs, nutrition logs
6. **Safety Alerts:** Automated alerts for health concerns (sleep deficit, overtraining, etc.)

### Authentication Flow
- JWT tokens stored in localStorage
- Bearer token authentication via Authorization header
- Role-based access control with middleware
- Invite code system for parent-teen account linking

### Project Structure
```
├── client/src/          # React web frontend
│   ├── components/      # UI components (shadcn + custom)
│   ├── pages/           # Route pages
│   ├── lib/             # Utilities (auth, queryClient)
│   └── hooks/           # Custom React hooks
├── mobile/              # React Native Expo mobile app
│   ├── app/             # Expo Router screens
│   │   ├── (auth)/      # Login & register screens
│   │   ├── (teen-onboarding)/  # Teen onboarding flow (6 steps)
│   │   ├── (parent-onboarding)/ # Parent onboarding flow (3 steps)
│   │   └── (teen-app)/  # Teen main app with bottom tabs
│   │       ├── home.tsx         # Dashboard with readiness, morning brief, schedule
│   │       ├── plan/            # Week calendar with activities
│   │       ├── log/             # Meal, workout, PT, check-in logging
│   │       ├── insights.tsx     # Charts and trends
│   │       └── settings/        # Goals, sharing, connections, notifications
│   ├── components/
│   │   ├── ui/          # Reusable UI components (Button, Card, Input, Slider, Select)
│   │   └── teen/        # Teen-specific components (cards, indicators)
│   ├── hooks/           # useAuth, useApi hooks
│   ├── services/        # API client & secure storage
│   └── types/           # TypeScript type definitions
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations
│   ├── auth.ts          # Authentication utilities
│   └── db.ts            # Database connection
├── shared/              # Shared code
│   └── schema.ts        # Drizzle schema + Zod validation
└── migrations/          # Database migrations
```

## Mobile App (React Native Expo)

### Overview
The mobile app is built with React Native and Expo SDK 51, designed for iOS with a calming color palette (soft greens, blues, whites) and large touch targets for teen usability.

### Tech Stack
- **Framework:** React Native with Expo SDK 51
- **Navigation:** Expo Router (file-based routing)
- **State Management:** TanStack React Query
- **Storage:** expo-secure-store for auth tokens
- **Icons:** @expo/vector-icons (Ionicons)

### Mobile App Screens
1. **Auth Flow:** Login, Register with role selection (teen/parent)
2. **Teen Onboarding (6 steps):** Age range, Goals with priority sliders, Sports, Weekly availability, Apple Health connection (Phase 2), Parent linking
3. **Parent Onboarding (3 steps):** Generate invite code, Supervision level (Light/Moderate/Full), Guardrails configuration
4. **Teen App Tabs (5 tabs):**
   - **Home:** ReadinessIndicator, MorningBriefCard, TodayScheduleCard (with availability selector), RecommendationsCard
   - **Plan:** Week calendar view, activity cards, add activity modal with type/duration/intensity
   - **Log:** Quick action grid (Meal, Workout, PT/Brace, Check-in) with dedicated screens:
     - Meal log: Type, photo, description, optional macros
     - Workout log: Quick templates, workout type, sport selector (for practice/game), duration, RPE
     - PT log: Exercise list with timer modal (play/pause, set tracking, next set, mark complete), brace tracking
     - Check-in: Energy, soreness, mood, stress levels using icon-based indicators (no emojis), pain flag
   - **Insights:** Sleep vs Training chart, Macro adherence, Consistency score
   - **Settings:** Goals & priorities, Privacy & sharing controls, Health connections (Apple Health), Notifications, Account

5. **Parent App Tabs (4 tabs):**
   - **Overview:** TeenStatusCard (status indicators with privacy gating), WeeklySummaryCard (sleep/training/nutrition metrics), AtRiskIndicators (areas to discuss), GuardrailsStatusCard
   - **Trends:** Date range selector (7/14/30 days), Sleep trend chart, Training load chart, Check-in trends (with consent gating for detailed vs limited view)
   - **Alerts:** Filterable alert list (All/Sleep/Training/Pain/Mood), severity color coding (info/warning/critical), suggested actions, acknowledgment workflow
   - **Settings:** Supervision levels (Light/Moderate/Full), Safety guardrails (max training, min sleep, no weight-loss mode, alert thresholds), Notification preferences, Account management

### Running the Mobile App
```bash
cd mobile
npm install
npx expo start
```

### Environment Variables (Mobile)
- `EXPO_PUBLIC_API_URL`: Backend API URL (defaults to http://localhost:5000)

## External Dependencies

### Database
- **PostgreSQL:** Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM:** Schema management and query building

### Authentication & Security
- **jsonwebtoken:** JWT token generation and verification
- **bcryptjs:** Password hashing
- **express-session / connect-pg-simple:** Session management (available but JWT primarily used)

### UI Framework
- **Radix UI:** Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Tailwind CSS:** Utility-first styling
- **class-variance-authority:** Component variant management
- **Lucide React:** Icon library

### Data & State
- **TanStack React Query:** Server state management and caching
- **date-fns:** Date manipulation
- **Zod:** Schema validation (integrated with Drizzle via drizzle-zod)

### Build & Development
- **Vite:** Frontend build tool with HMR
- **esbuild:** Server bundling for production
- **tsx:** TypeScript execution for development

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for JWT signing (falls back to development default)

## Safety Alert System

### Overview
The safety alert system monitors teen health data and generates supportive alerts when concerning patterns are detected. Alerts use non-shame-based language and recommend professional consultation for critical issues.

### Safety Rules (8 types)
1. **sleep_deficit** - Avg sleep below 7hrs over 7 days (critical)
2. **training_spike** - Training increased 30%+ week-over-week (warning)
3. **pain_flag** - Pain reported in recent check-in (warning)
4. **low_energy** - Avg energy below 3/10 over 7 days (info)
5. **high_stress** - Avg stress above 7/10 over 7 days (warning)
6. **restrictive_eating** - Low calories + weight-loss goal active (critical)
7. **overtraining** - Training 7+ days consecutive (warning)
8. **low_intake** - Low calorie intake without weight goal (info)

### Scheduling
- Runs daily at 8am in each teen's local timezone
- Uses date-fns-tz for DST-safe timezone calculations
- Per-teen scheduling with individual timeout management
- Persists lastSafetyCheckAt to prevent duplicate runs across restarts

### Configuration Environment Variables
- `ENABLE_SAFETY_SCHEDULER`: Set to "true" to enable (default: false)
- `SAFETY_CHECK_HOUR`: Hour to run checks (default: 8)
- `SAFETY_CHECK_TIMEZONE`: Default timezone for teens without profile timezone (default: America/New_York)

### API Endpoints
- `GET /api/safety-alerts` - Teen's own alerts
- `PUT /api/safety-alerts/:id/acknowledge` - Teen acknowledges alert
- `GET /api/parent/alerts` - Parent-visible alerts (respects shareWithParent flag)
- `PUT /api/parent/alerts/:id/acknowledge` - Parent acknowledges alert
- `POST /api/safety-check` - Manual trigger for teen's safety check
- `POST /api/push-token` - Register push notification token

### Push Notifications
- Uses Expo Push API for real notifications
- Sends to teen and linked parents (respecting shareWithParent)
- Push tokens stored in profiles.pushToken field

## Evidence Library (RAG for Recommendations)

### Overview
The evidence library provides research-backed health recommendations for the LLM to reference when generating personalized guidance. All recommendations cite authoritative sources.

### Location
- Data: `server/data/evidence-library.json`
- Service: `server/services/evidenceLibrary.ts`

### Evidence Categories
- **sleep**: Teen sleep requirements, consistency, screen time, growth hormone
- **nutrition**: Calories, protein, calcium, Vitamin D, meal timing, hydration
- **training**: Daily activity, resistance training, overtraining, rest days, warmup
- **bone_health**: Weight-bearing exercise, nutrition triad
- **scoliosis**: PT exercises, adherence, when to consult provider

### Service Functions
- `searchEvidence(query)`: Find evidence by goals, categories, or conditions
- `getEvidenceById(id)`: Get specific evidence entry
- `getEvidenceByCategory(category)`: Get all evidence for a category
- `getEvidenceByGoal(goal)`: Get evidence applicable to a goal
- `getRecommendationForCondition(condition, variables)`: Get templated recommendation
- `formatEvidenceForLLM(evidence)`: Format evidence for LLM context

### Evidence Structure
```json
{
  "id": "sleep-teens-001",
  "category": "sleep",
  "title": "Teen Sleep Requirements",
  "summary": "Research summary...",
  "source": "CDC",
  "source_url": "https://...",
  "applicable_goals": ["growth", "muscle"],
  "recommendation_templates": [
    {
      "condition": "sleep_below_8_hours",
      "action": "Aim for bedtime by {calculated_bedtime}...",
      "priority": "high"
    }
  ]
}
```