# Outdoor AI

**Look. Ask. Play.**

Phase 1 foundation for a hardware-independent outdoor assistant, initially focused on golf.

## Current scope

- React Native + Expo mobile starter (iOS first; Android-compatible).
- NestJS REST backend with liveness and PostgreSQL readiness endpoints.
- Prisma ORM and PostgreSQL development database. No domain tables yet.
- Strict TypeScript, npm workspaces, unit/API/integration tests, and GitHub Actions.

No authentication, AI, golf calculations, course data, or glasses integration is implemented.

## Develop remotely

Open this repository in **GitHub Codespaces** on the foundation branch. Use Node 24 LTS and npm. All commands below run in the Codespace terminal at the repository root.

```bash
npm ci
npm run env:init
npm run prisma:validate
npm run prisma:generate
docker compose --env-file .env -f infrastructure/compose.yaml up -d --wait
npm run typecheck
npm test
npm run test:integration
npm run build
npm run build:mobile
```

Run the backend with `npm run dev:backend`. In another terminal:

```bash
curl --fail http://127.0.0.1:3000/api/v1/health
curl --fail http://127.0.0.1:3000/api/v1/health/ready
```

Expected bodies: `{"status":"ok"}` and `{"status":"ok","database":"up"}`.

Run the mobile bundler with `npm run dev:mobile`. See [development instructions](docs/development.md) for remote device access and native verification limitations.

## Documentation

- [Architecture and boundaries](docs/architecture.md)
- [Development, environment, testing, and Git workflow](docs/development.md)
- [Phase 1 scope and verification](docs/phase-1.md)
- [Exact file inventory](docs/files.md)

Review Phase 1 before approving Phase 2. Do not merge unreviewed work into main.
