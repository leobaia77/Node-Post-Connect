# GrowthTrack - Teen Health Tracking App

## Overview
GrowthTrack is a health tracking application designed for teen athletes with integrated parent oversight. It allows teens to log and monitor key health metrics like sleep, workouts, nutrition, and daily check-ins. Parents can supervise their children's health data through configurable guardrails and sharing preferences, ensuring appropriate monitoring without compromising privacy. The project aims to provide personalized, evidence-based recommendations to teens while ensuring safety and compliance with health data regulations (e.g., Apple HealthKit).

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Web App:** React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, shadcn/ui with Radix UI for components, Tailwind CSS for styling (with light/dark mode), and Vite for building.
- **Mobile App:** React Native with Expo SDK 51, Expo Router for navigation, TanStack React Query for state, expo-secure-store for authentication tokens, and @expo/vector-icons. Designed for iOS with a calming color palette and large touch targets.

### Backend
- **Framework:** Express.js with TypeScript, providing RESTful API endpoints.
- **Authentication:** JWT-based token authentication with bcryptjs for password hashing. Role-based access control is enforced through middleware, and an invite code system links parent and teen accounts.
- **Build:** esbuild for production bundling, optimized for cold start performance.

### Database
- **ORM:** Drizzle ORM with PostgreSQL dialect.
- **Schema:** Defined in `shared/schema.ts`, shared between client and server.
- **Migrations:** Managed with Drizzle Kit.
- **Connection:** Node-postgres (pg) pool.

### Key Features
- **User & Profile Management:** Role-based (teen, parent, admin) with distinct profiles and goals.
- **Parent-Teen Linking:** Secure invite code system with configurable supervision levels.
- **Parent Guardrails:** Customizable limits for training, sleep, and nutrition to ensure teen safety.
- **Health Logging:** Comprehensive logging for daily check-ins, sleep, workouts, and nutrition.
- **Safety Alert System:** Monitors health data against predefined rules to generate non-shame-based alerts for concerning patterns (e.g., sleep deficit, overtraining, pain flags). Alerts are scheduled daily, localized by timezone, and support push notifications via Expo Push API.
- **AI Recommendations (LLM Orchestrator):** Generates personalized, evidence-based health recommendations using OpenAI GPT models (via Replit AI Integrations). It incorporates a strict safety filter to prevent harmful advice (e.g., extreme dieting, unapproved supplements) and validates all recommendations against an internal evidence library.
- **Evidence Library:** A RAG-based system providing research-backed health recommendations from authoritative sources across categories like sleep, nutrition, training, and bone health, used to ground LLM outputs.

### Project Structure
Organized into `client/` (React web frontend), `mobile/` (React Native Expo app), `server/` (Express backend), and `shared/` (common code including Drizzle schema).

## External Dependencies

### Database
- **PostgreSQL:** Primary data store (`DATABASE_URL`).
- **Drizzle ORM:** Database schema definition and query construction.

### Authentication & Security
- **jsonwebtoken:** For JWT token generation and verification.
- **bcryptjs:** For secure password hashing.

### UI/UX
- **Radix UI:** Provides accessible, unstyled components.
- **Tailwind CSS:** Utility-first CSS framework for styling.
- **class-variance-authority:** Manages component variants.
- **Lucide React:** Icon library.

### Data Management
- **TanStack React Query:** Handles server state management and caching across both web and mobile clients.
- **date-fns:** Utility library for date manipulation.
- **Zod:** Schema validation, integrated with Drizzle.

### Build Tools
- **Vite:** Frontend build tool for the web client.
- **esbuild:** Used for efficient backend bundling.
- **tsx:** TypeScript execution environment for development.

### Integrations
- **OpenAI GPT Models:** Utilized by the LLM Orchestrator for AI-driven recommendations via Replit AI Integrations.
- **Expo Push API:** For sending push notifications to users.
- **Apple HealthKit:** (Planned integration) For connecting with Apple Health data, with strict compliance for data privacy.