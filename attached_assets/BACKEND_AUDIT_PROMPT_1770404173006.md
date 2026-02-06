# Backend Audit — Items to Verify and Fix

Last updated: February 6, 2026

The mobile app has been updated to align with the backend's actual API contract. This document covers remaining items the backend team should verify and, where needed, fix.

---

## IMMEDIATE — Please Verify These (Frontend Already Fixed)

### 1. Push Token Field Name (HIGH)
- **Frontend now sends:** `{ pushToken, platform }` to `POST /api/push-token`
- **Please verify:** Does the backend read `req.body.pushToken`? If it reads `req.body.token` instead, please update to accept `pushToken`.

### 2. Onboarding Complete Endpoint (HIGH)
- **Frontend now calls:** `POST /api/onboarding/complete` (no body needed)
- **Please verify:** Does this endpoint exist and does it set `onboardingComplete = true` on the users table (not the profiles table)?
- Previously the app was calling `PUT /api/profile` with `{ onboardingComplete: true }`, which silently failed because `onboardingComplete` is on the users table.

### 3. PT Adherence Route (MEDIUM)
- **Frontend now calls:** `POST /api/scoliosis/pt-adherence` (the validated route)
- **Previously called:** `POST /api/pt-adherence` (unvalidated legacy route)
- **Please verify:** The `/api/scoliosis/pt-adherence` route works correctly and accepts the same fields.
- **Suggestion:** Consider removing or deprecating the legacy `POST /api/pt-adherence` route since it has no body validation.

### 4. PT Routine Update Route (MEDIUM)
- **Frontend calls:** `PATCH /api/scoliosis/routines/:id`
- **Please verify:** Does this route exist on the backend? If not, it needs to be added. The frontend uses it to update PT routines.

---

## BACKEND-ONLY ITEMS — Not Affecting Frontend

### 5. CORS Configuration (MEDIUM)
- The CORS config falls back to `origin: true` (allow all) when `ALLOWED_ORIGINS` is not set.
- **Action:** Set `ALLOWED_ORIGINS` in environment/secrets before production deploy. Consider failing closed (deny all) if not set.

### 6. Body Validation on Remaining Routes (MEDIUM)
These POST routes still spread `req.body` without Zod validation:
- `POST /api/pt-adherence` (legacy — see item 3 above)
- `POST /api/pt-routine`
- `POST /api/scoliosis/brace-logs` (manual entry)
- **Action:** Add Zod schemas to these routes for consistency and security.

### 7. Duplicate PT Adherence Routes (LOW)
Two routes exist for the same purpose:
- `POST /api/pt-adherence` (no validation, directly passes `req.body`)
- `POST /api/scoliosis/pt-adherence` (explicit field extraction, more secure)
- **Action:** Consolidate into one. The frontend now uses `/api/scoliosis/pt-adherence`.

### 8. Unused Frontend Dependencies in Backend (LOW)
41 frontend packages (React, Radix, Tailwind, Recharts, etc.) are listed in the backend's `package.json` but never imported by server code. Also unused: `express-session`, `passport`, `passport-local`, `memorystore`.
- **Action:** Remove unused dependencies to reduce install time and attack surface.

### 9. Stale `mobile/` Directory (LOW)
The backend repo still contains a `mobile/` directory with old copies of the mobile app code. The canonical mobile app lives in a separate Replit project.
- **Action:** Delete the `mobile/` directory.

### 10. No Database Migrations Tracked (MEDIUM — Pre-Production)
Currently using `drizzle-kit push` with no migration files. No rollback capability or audit trail.
- **Action:** Switch to `drizzle-kit generate` + `drizzle-kit migrate` workflow before production.

### 11. `dailyTargetHours` Decimal/String Handling (LOW)
`braceSchedules.dailyTargetHours` is stored as decimal but Drizzle returns it as a string. The `buildMorningBrief` function now uses `parseFloat()` correctly, but other consumers may not.
- **Action:** Audit all consumers of `dailyTargetHours` to ensure they handle the string-to-number conversion.

### 12. Health Check Endpoint (LOW)
No dedicated `/api/health` endpoint exists. The root `/` returns `{ status: "ok" }` which partially works.
- **Action:** Optional — add a `/api/health` endpoint that also checks DB connectivity for monitoring.

### 13. Safety Checker Scheduler (LOW — Beta Acceptable)
Uses `setTimeout`/`setInterval` — all scheduled checks are lost on server restart.
- **Action:** Acceptable for beta. For production, consider a job queue (Bull, Agenda) or cron-based approach.

---

## CONFIRMED GAPS — Backend Needs to Build

### 14. Mental Health Logging (HIGH)
- **`POST /api/mental-health`** — Create mental health log
  - Body: `{ date, type ("meditation"|"mood"|"journal"), subType, durationMinutes, moodLevel, notes }`
- **`GET /api/mental-health`** — Retrieve logs with `?start_date=&end_date=`
- Requires a `mentalHealthLogs` table

### 15. Email Data Export (LOW)
- **`POST /api/data-export/email`** — Send data export to user's email
- The frontend has removed the email option for now and just shows "Export Ready" confirmation. This can be added later when the backend supports it.

### 16. Enhanced PT Adherence Fields (LOW)
The app sends these fields but they may be ignored:
- `difficultyRating` (1-5)
- `painLevel` ("none" | "mild" | "significant")
- `cobbAngle` (number)
- `lastMeasuredDate` (ISO date)
- `backFeeling` (string)
- `durationMinutes` (number)
- **Action:** Add these columns to the PT adherence table if not already present.

---

## ALREADY FIXED ON FRONTEND

| Issue | Fix Applied |
|-------|-------------|
| `painFlag` vs `hasPainFlag` | App sends `hasPainFlag` |
| `protein/carbs/fat` vs `proteinG/carbsG/fatG` | App sends correct field names |
| `description` vs `notes` (nutrition) | App sends `notes` |
| `startDate/endDate` vs `start_date/end_date` | App uses snake_case |
| GET `/api/checkin` vs `/api/checkins` | App uses plural |
| GET `/api/workout` vs `/api/workouts` | App uses plural |
| Brace paths | App uses `/api/scoliosis/brace-*` |
| Symptom paths | App uses `/api/scoliosis/symptoms` |
| Brace schedule update method | App uses `PATCH` |
| PT routine paths | App uses `/api/scoliosis/routines` |
| Data export path | App uses `/api/export-data` |
| Account delete body | App sends `{ confirmEmail }` |
| `securityWord` on register | App includes it |
| Auth response normalization | App handles split `user/profile/userProfile` |
| Push token field | App sends `{ pushToken }` (not `{ token }`) |
| Onboarding complete | App calls `POST /api/onboarding/complete` |
| PT adherence path | App calls `/api/scoliosis/pt-adherence` |
| Data export email | Removed misleading email flow from UI |
| Workout IDs | `water_polo` and `sport_practice` (underscores) |
| Check-in painNotes | Sends `""` instead of `null` when no pain |

---

## FIELD REFERENCE

### Check-in POST body:
```json
{
  "date": "2026-02-06",
  "energyLevel": 7,
  "sorenessLevel": 3,
  "moodLevel": 8,
  "stressLevel": 4,
  "hasPainFlag": false,
  "painNotes": ""
}
```

### Nutrition POST body:
```json
{
  "date": "2026-02-06",
  "mealType": "lunch",
  "notes": "Grilled chicken salad",
  "calories": 650,
  "proteinG": 35,
  "carbsG": 80,
  "fatG": 20,
  "source": "manual"
}
```

### Push Token POST body:
```json
{
  "pushToken": "ExponentPushToken[xxxx]",
  "platform": "ios"
}
```

### All GET log queries use snake_case:
```
?start_date=2026-02-01&end_date=2026-02-28
```
