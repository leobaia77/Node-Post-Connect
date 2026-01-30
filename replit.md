# GrowthTrack - Teen Health Tracking App

## Overview
GrowthTrack is a health tracking application designed for teen athletes with integrated parent oversight. It allows teens to log and monitor key health metrics like sleep, workouts, nutrition, and daily check-ins. Parents can supervise their children's health data through configurable guardrails and sharing preferences, ensuring appropriate monitoring without compromising privacy. The project aims to provide personalized, evidence-based recommendations to teens while ensuring safety and compliance with health data regulations (e.g., Apple HealthKit).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Mobile-Only Architecture
This project uses a **mobile-first architecture** with:
- **Backend API:** Express.js server running on Replit (this project)
- **Mobile App:** React Native with Expo (separate Replit project required for TestFlight publishing)

### Backend (This Project)
- **Framework:** Express.js with TypeScript, providing RESTful API endpoints.
- **Authentication:** JWT-based token authentication with bcryptjs for password hashing. Role-based access control is enforced through middleware, and an invite code system links parent and teen accounts.
- **CORS:** Enabled for cross-origin mobile app connections.
- **Build:** esbuild for production bundling, optimized for cold start performance.

### Mobile App (Separate Project)
- **Location:** `mobile/` folder contains the React Native Expo app code
- **Stack:** React Native with Expo SDK 51, Expo Router for navigation, TanStack React Query for state, expo-secure-store for authentication tokens, and @expo/vector-icons.
- **Design:** iOS-focused with a calming color palette and large touch targets.
- **Deployment:** Requires a separate Replit project for TestFlight publishing. See `mobile/README.md` for setup instructions.

### Database
- **ORM:** Drizzle ORM with PostgreSQL dialect.
- **Schema:** Defined in `shared/schema.ts`.
- **Migrations:** Managed with Drizzle Kit.
- **Connection:** Node-postgres (pg) pool.

### Key Features
- **User & Profile Management:** Role-based (teen, parent, admin) with distinct profiles and goals.
- **Parent-Teen Linking:** Secure invite code system with configurable supervision levels.
- **Parent Guardrails:** Customizable limits for training, sleep, and nutrition to ensure teen safety.
- **Health Logging:** Comprehensive logging for daily check-ins, sleep, workouts, and nutrition.
- **Safety Alert System:** Monitors health data against predefined rules to generate non-shame-based alerts for concerning patterns (e.g., sleep deficit, overtraining, pain flags). Alerts are scheduled daily, localized by timezone, and support push notifications via Expo Push API.
- **AI Recommendations (LLM Orchestrator):** Generates personalized, evidence-based health recommendations using OpenAI GPT models (via Replit AI Integrations). It incorporates a strict safety filter to prevent harmful advice (e.g., extreme dieting, unapproved supplements) and validates all recommendations against an internal evidence library.
- **Evidence Library:** A RAG-based system providing research-backed health recommendations from authoritative sources across categories like sleep, nutrition, training, bone health, and scoliosis, used to ground LLM outputs.
- **Scoliosis Care Module:** Comprehensive scoliosis management including:
  - **PT Routine Management:** Prescribed physical therapy exercises with timer, reps/sets tracking, and adherence logging. Exercises linked via junction table for reusability.
  - **Brace Tracking:** Real-time session timer, daily wear time goals, progress visualization against prescribed hours.
  - **Symptom Logging:** Interactive body diagram with coordinate-based pain location tracking, discomfort levels, and red flag warnings for serious symptoms (numbness, weakness, bladder issues).
  - **Educational Resources:** Curated content organized by topic (exercise, brace care, lifestyle, mental health) with external resource links.
  - **LLM Safety Rules:** Scoliosis-specific guardrails preventing advice that could override PT/orthotist prescriptions, with automatic escalation for red flag symptoms.
  - Mobile screens: `mobile/app/(teen-app)/scoliosis/` (dashboard, pt-routine, brace-tracker, symptom-log, resources)
  - API endpoints: `/api/pt-routines`, `/api/pt-exercises`, `/api/pt-adherence`, `/api/brace-schedules`, `/api/brace-logs`, `/api/scoliosis-symptoms`

### Project Structure
- `server/` - Express backend API
- `shared/` - Common code including Drizzle schema
- `mobile/` - React Native Expo app (to be deployed as separate Replit project)

## External Dependencies

### Database
- **PostgreSQL:** Primary data store (`DATABASE_URL`).
- **Drizzle ORM:** Database schema definition and query construction.

### Authentication & Security
- **jsonwebtoken:** For JWT token generation and verification.
- **bcryptjs:** For secure password hashing.

### Data Management
- **date-fns:** Utility library for date manipulation.
- **Zod:** Schema validation, integrated with Drizzle.

### Build Tools
- **esbuild:** Used for efficient backend bundling.
- **tsx:** TypeScript execution environment for development.

### Integrations
- **OpenAI GPT Models:** Utilized by the LLM Orchestrator for AI-driven recommendations via Replit AI Integrations.
- **Expo Push API:** For sending push notifications to users.
- **Apple HealthKit:** Fully integrated for iOS devices. Read-only access to sleep, workouts, activity, and nutrition data. Complies with Apple's HealthKit guidelines: no advertising use, encrypted storage, clear data deletion mechanism in settings. Services: `mobile/services/healthKit.ts`, hook: `mobile/hooks/useHealthKitSync.ts`, backend sync endpoint: `POST /api/health-sync`.

### App Store Readiness (Mobile)
- **Legal Documentation:** Privacy Policy and Terms of Service screens accessible from Settings with comprehensive health data policies, medical disclaimers, and age requirements (13+).
- **Data Portability:** Export feature supporting JSON and CSV formats with email and download options. Located at `mobile/app/(teen-app)/settings/data-export.tsx`. Backend endpoint: `GET /api/export-data?format=json|csv` - exports all user health data including check-ins, sleep, workouts, nutrition, PT routines, brace logs, symptoms, and safety alerts.
- **Account Deletion:** 2-step confirmation flow with explicit user acknowledgment before permanent deletion. Includes warnings about data loss and HealthKit disconnection. Backend endpoint: `DELETE /api/account` - requires `confirmEmail` in body matching user's email, performs cascade deletion of all user data respecting foreign key constraints.
- **Offline Support:** 
  - Data caching with 7-day expiry using AsyncStorage
  - Sync queue for offline actions with 3 retry attempts
  - Fetch-based network detection (avoids SDK conflicts)
  - Automatic sync on reconnect
  - Services: `mobile/services/offlineManager.ts`, hooks: `mobile/hooks/useOffline.ts`
- **UI Components:** Production-ready components for loading states, skeleton loaders with shimmer animations, empty states (data/search/error/offline variants), and offline indicators with accessibility support. Located in `mobile/components/`.
- **App Assets:** Generated icon.png, splash.png, adaptive-icon.png, and favicon.png in `mobile/assets/` with teal/emerald brand colors.

## Deployment Guide

### Backend API (This Project)
1. Use Replit's Publishing pane to deploy this backend
2. Copy the published URL (e.g., `https://your-project.replit.app`)
3. This URL will be used as `EXPO_PUBLIC_API_URL` in the mobile app

### Mobile App (Separate Project)
1. Create a new Replit project using React Native/Expo template
2. Copy contents of `mobile/` folder to the new project
3. Create `.env` file with `EXPO_PUBLIC_API_URL=https://your-backend-url.replit.app`
4. Install dependencies: `npm install`
5. Publish to Expo Go first, then Publish to App Store for TestFlight
6. See `mobile/README.md` for detailed instructions
