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
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn + custom)
│   ├── pages/           # Route pages
│   ├── lib/             # Utilities (auth, queryClient)
│   └── hooks/           # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations
│   ├── auth.ts          # Authentication utilities
│   └── db.ts            # Database connection
├── shared/              # Shared code
│   └── schema.ts        # Drizzle schema + Zod validation
└── migrations/          # Database migrations
```

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