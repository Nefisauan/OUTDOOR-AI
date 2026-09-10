# Phase 1 architecture

```text
apps/mobile   Expo / React Native / TypeScript
              No backend calls or fabricated connection status yet

backend       NestJS REST API / TypeScript
  /api/v1/health         process liveness, independent of PostgreSQL
  /api/v1/health/ready   real Prisma SELECT 1; HTTP 503 when unavailable
       |
  Prisma PostgreSQL adapter
       |
  PostgreSQL 17 (Docker in development and disposable CI service)
```

Use npm workspaces instead of an additional monorepo framework. Keep the official Expo template's React and React Native versions together. Use stable Prisma 7, avoiding the registry's Prisma 8 release candidate. NestJS uses CommonJS and Prisma generates compatible CommonJS code. No Nest CLI is required: TypeScript compiles the small backend directly.

Environment validation fails early for missing database configuration, invalid ports, or invalid modes. Database readiness has bounded connection and query timeouts; liveness works during a database outage. Database failure details and credentials are not returned by the health endpoint. Shutdown closes Prisma connections. Health endpoints are diagnostics, not a security or production deployment claim.

The root TypeScript configuration carries shared strictness; each workspace selects its own runtime and compiler settings. Generated Prisma code and build output are ignored. No models or artificial migrations are necessary until Phase 2. Migration instructions are in backend/prisma/migrations/README.md.

The mobile screen intentionally makes no claim about backend availability. Mobile-to-API integration will be added when a phase needs it, with environment configuration and tests then.

Reserved directories (documentation only): apps/web, ai, golf, glasses, shared. Hardware interfaces and mocks belong to Phase 9. Golf calculations belong to Phase 5; LLM explanations belong to Phase 7. Neither depends on a manufacturer SDK.
