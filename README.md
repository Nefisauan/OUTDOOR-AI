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

Use Node 24 LTS, npm, Git, and Docker with Compose v2. GitHub Codespaces supplies these prerequisites through the included devcontainer. For local development, install them first. Native iOS builds additionally require macOS and compatible Xcode (see the development guide).

Phase 1 is on `feature/phase-1-foundation` pending review and merge. Clone it explicitly:

```bash
git clone --branch feature/phase-1-foundation https://github.com/Nefisauan/OUTDOOR-AI.git
cd OUTDOOR-AI
```

For a private repository, authenticate Git with GitHub first. Alternatively open that branch in GitHub Codespaces. Run the commands below at the repository root. Ports 3000, 5432, and 8081 must be available.

For a second clone on the same Docker host, stop the first clone’s PostgreSQL container and run `export COMPOSE_PROJECT_NAME=outdoor-ai-validation` in the new clone’s terminals to isolate its volume. Do not reuse a database volume with newly generated credentials.

```bash
npm ci
npm run env:init
npm run prisma:validate
npm run prisma:generate
docker compose --env-file .env -f infrastructure/compose.yaml up -d --wait
npm run lint
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
