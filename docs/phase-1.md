# Phase 1 — Foundation

## Delivered scope

Monorepo layout; strict TypeScript; basic Expo mobile screen; basic NestJS backend; PostgreSQL; Prisma; environment templates and initialization; Git workflow; basic testing and CI; documentation.

No Phase 2 user system or future-phase features are included.

## Acceptance checks

- npm ci resolves the committed lockfile.
- Prisma validation and client generation succeed without domain models.
- Both workspaces type-check.
- Unit/API/mobile tests pass.
- Real PostgreSQL readiness integration passes.
- Backend compilation and iOS/Android JavaScript export pass.
- Liveness remains available when PostgreSQL is stopped; readiness returns 503 and recovers after restart.
- No .env files, passwords, generated Prisma client, or node_modules are committed.

## Verification record

Verified in GitHub Codespaces on 2026-09-10 with Node 24.19.0 and npm 11.17.0. Clean npm ci, Prisma validation/generation, both workspace type checks, 20 unit/API/mobile tests, one real PostgreSQL integration test, backend compilation, and iOS/Android JavaScript exports all passed. npm audit reported zero vulnerabilities. Prisma generation also passed without DATABASE_URL or an environment file.

The compiled API passed the database outage/recovery check: liveness remained HTTP 200, readiness returned HTTP 503 while PostgreSQL was stopped, and readiness recovered to HTTP 200 after restart. The corrected devcontainer image was rebuilt successfully and subsequently restarted successfully. Staged paths and source were checked to exclude generated files and the actual development database password.

GitHub Actions runs the committed checks for pushes and pull requests; consult the pull request checks for its latest result. Native iPhone/Android device testing and signed native builds have not been performed.

## Review boundary

Review this foundation and its PR. Only after approval, Phase 2 adds authentication and the user/player profile system, including its first domain migration.
