# Phase 2 — accounts and player profiles

Phase 2 branches from the validated Phase 1 commit `3ecf95750ad255c69c43b45d8ca5d454dfc54de4`. It adds no clubs, rounds, shots, courses, weather, AI, or glasses functionality.

## Architecture

- The shared npm workspace exports Zod schemas, enums, and TypeScript API contracts. It has no NestJS, Prisma, or React dependency. npm ci builds its ignored dist output; root development/test/build commands rebuild it.
- NestJS auth and profile modules keep business logic in services. Controllers only route requests. A session guard derives the user ID; profile bodies reject unknown properties, including userId.
- PostgreSQL stores User, Session, and a one-to-one PlayerProfile. Unique constraints prevent duplicate emails and duplicate profiles. Foreign keys link sessions/profiles to users with cascading deletion. All schema changes are versioned migrations.
- Profile PATCH validates the merged record, including years-playing versus age, inside a serializable transaction with conflict retries.

## Profile contract

All fields below are required when creating a profile. PATCH accepts a nonempty subset. Numeric values must be JSON numbers, not strings or null. Responses also contain id, userId, createdAt, and updatedAt.

| Field                | Meaning and validation                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| dateOfBirth          | Real YYYY-MM-DD date; calculated UTC calendar age 5–120. Stored as PostgreSQL DATE, so age does not become stale.                                   |
| heightCm             | 50–250 centimetres                                                                                                                                  |
| weightKg             | 10–350 kilograms                                                                                                                                    |
| handicap             | -10 through 54; a plus handicap is represented negatively (plus 2 = -2). This is a stored user-entered index, not an official handicap calculation. |
| skillLevel           | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT                                                                                                            |
| handedness           | RIGHT, LEFT                                                                                                                                         |
| yearsPlaying         | Whole years, 0–120, no greater than age                                                                                                             |
| typicalScore         | Whole-number total for 18 holes, 18–300                                                                                                             |
| typicalBallFlight    | DRAW, FADE, STRAIGHT, MIXED, UNKNOWN                                                                                                                |
| typicalMissDirection | LEFT, RIGHT, SHORT, LONG, VARIABLE, UNKNOWN                                                                                                         |

Application validation lives in shared/src/index.ts. Prisma's database enum representation is checked against these shared values by integration tests. Bounds are deliberately broad input sanity limits, not eligibility or medical judgments. Date of birth and physical measurements are private profile information; the API only returns them to the owner.

## Authentication

Register and sign in with email and a 12–128-character password. Email is trimmed and case-normalized. Passwords use a random 16-byte salt and Node scrypt (N=131072, r=8, p=1), with constant-time hash comparison. Passwords are never returned. Unknown-account login performs the same hash work and returns the same invalid-credentials message.

Successful authentication returns a 32-byte opaque bearer token and expiresAt. Only its SHA-256 hash is stored in PostgreSQL. Sessions last 24 hours; logout revokes the session immediately. Expired sessions are rejected and removed for that account when another session is created. The mobile app keeps its token only in memory and requires sign-in after restart. No token or password is saved in ordinary device storage.

Registration and login are limited to 10 requests per minute per IP per route using Nest's in-process throttler. This foundation assumes a single API instance; horizontal scaling requires shared rate-limit storage and explicitly reviewed proxy/IP configuration. Use HTTPS for real credentials outside loopback development. There is no password recovery, email verification, MFA, or account-deletion UI in this phase. This is an account/profile foundation, not a public-production launch checklist.

## REST API

Base path: /api/v1. Use Content-Type: application/json for request bodies. Authenticated routes require Authorization: Bearer TOKEN. No route accepts another user's ID.

| Method and path     | Success                     | Other expected responses                               |
| ------------------- | --------------------------- | ------------------------------------------------------ |
| POST /auth/register | 201: user, token, expiresAt | 400 invalid input; 409 email exists; 429 rate limit    |
| POST /auth/login    | 200: user, token, expiresAt | 400 invalid input; 401 bad credentials; 429 rate limit |
| POST /auth/logout   | 204, empty body             | 401 missing/invalid/expired session                    |
| POST /profile       | 201: profile                | 400 validation; 401 unauthorized; 409 already exists   |
| GET /profile        | 200: profile                | 401 unauthorized; 404 missing profile                  |
| PATCH /profile      | 200: updated profile        | 400 validation; 401 unauthorized; 404 missing profile  |
| GET /health         | 200: status ok              | Independent of database availability                   |
| GET /health/ready   | 200: database up            | 503: database down                                     |

Validation errors contain message and fields for inline display. Malformed JSON returns 400. Unknown ID-based profile routes return 404. Profile/auth responses use Cache-Control: no-store.

Example profile JSON:

```json
{
  "dateOfBirth": "1990-05-21",
  "heightCm": 180,
  "weightKg": 80,
  "handicap": 12.5,
  "skillLevel": "INTERMEDIATE",
  "handedness": "RIGHT",
  "yearsPlaying": 10,
  "typicalScore": 90,
  "typicalBallFlight": "FADE",
  "typicalMissDirection": "RIGHT"
}
```

## Migration and fresh setup

Follow the root README. After starting PostgreSQL, run npm run db:deploy. This applies committed migrations on either a fresh database or the empty Phase 1 schema. It is safe to run again; do not reset an existing database or use db push.

To create a future reviewed migration, invoke Prisma directly to avoid losing CLI arguments through nested npm scripts:

```bash
npm exec -w @outdoor-ai/backend -- prisma migrate dev --name meaningful_change --create-only
```

Review and commit the SQL before applying it. The Phase 2 migration creates only the three required tables and four enums. Database rollback is separate from code rollback: preserve a database backup; switching Git commits does not undo a migration. The Phase 1 health API can still run against this additive schema.

## Mobile setup and verification

Run npm run dev:backend in one terminal and npm run dev:mobile in another. Loopback defaults work for a simulator on the same host. A physical phone cannot reach another machine's 127.0.0.1.

For a reachable remote API, set EXPO_PUBLIC_API_URL in apps/mobile/.env to your HTTPS API URL ending in /api/v1 and restart Metro. This is a public address, never a secret. The API must also be reachable from the device. Codespaces ports remain private by default; private-port GitHub authentication is not automatically available to a native fetch request. Use an explicitly configured authenticated development network or approved HTTPS endpoint, rather than silently making ports public. Follow the development guide for a compatible Expo development build and reachable Metro endpoint.

The UI supports register/sign-in, initial onboarding, loading an existing profile, edits, validation errors, network retry, saved confirmation, and logout. Measurements are labelled cm/kg, score is explicitly 18 holes, and enum selections have accessible labels. An expired session returns the user to sign-in. No golf recommendations are shown.

## Tests and limitations

Run npm run lint, npm run typecheck, npm test, npm run test:integration, npm run build, and npm run build:mobile after migration setup. Integration tests create uniquely named test users and delete only those users; they do not reset the database. Never point tests at production.

Coverage includes every original Phase 1 test, shared field boundaries, calendar dates, enum parity, register/login/logout/expiry, profile create/get/update, missing profiles, malformed JSON, strict ownership, unique/FK relationships, and mobile account/create/edit/error flows. CI applies migrations to a fresh PostgreSQL service before integration tests.

Native device execution and signed iOS/Android builds require separate hardware/toolchains; component interaction tests and Metro export do not establish device-level verification. The release validation checklist is recorded in the Phase 2 pull request with the exact validated commit.
