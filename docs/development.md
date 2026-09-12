# Development guide

## Remote environment

Develop in GitHub Codespaces. The devcontainer defines Node 24, Docker, and GitHub CLI. Its post-create command installs the lockfile and generates Prisma. Existing Codespaces must be rebuilt to adopt devcontainer changes; this is not required to use an already compatible environment.

No Xcode or simulator runs inside Linux Codespaces. Physical iOS/Android builds and tests remain separate from JavaScript checks. Codespaces compute/storage and any Expo build services follow your account's quotas and billing settings. Stop the Codespace when finished.

## Setup and secrets

From the repository root run the README commands. `npm run env:init` creates root .env for Docker and backend/.env for the API with the same randomly generated development password. It refuses to overwrite either file. Values in .env.example are templates, not usable credentials. Production must use managed secrets.

The API reads backend/.env when launched by its workspace scripts. Prisma CLI and integration tests load that file through dotenv. CI supplies DATABASE_URL directly. Do not put secrets in EXPO_PUBLIC variables or commit .env files.

Development PostgreSQL listens on 127.0.0.1 only and persists in a Docker volume. Ports remain private in Codespaces. Stop it with:

```bash
docker compose --env-file .env -f infrastructure/compose.yaml stop
```

Do not delete its volume when you want to keep data. If a volume already exists, preserve the matching credentials rather than generating a different password.

## Run and verify

`npm run dev:backend` runs TypeScript with Node watch mode. `npm run build` compiles backend/dist. `npm start -w @outdoor-ai/backend` runs the compiled backend. All three use validated environment configuration.

`npm test` runs environment rejection tests, HTTP success/failure tests using a mocked database, and the rendered mobile screen test. `npm run test:integration` uses a real PostgreSQL database through Prisma; it must fail if that database is unavailable. `npm run build:mobile` exports iOS and Android JavaScript bundles, not signed native apps.

To manually verify outage handling, start the API, stop PostgreSQL, then request both endpoints. Liveness stays HTTP 200; readiness returns HTTP 503 with database down. Restart PostgreSQL and readiness must recover to HTTP 200 without restarting the API.

## Mobile device verification

`npm run dev:mobile` starts Metro. A phone cannot reach a Codespace's localhost directly. A compatible Expo development build and a reachable Metro endpoint are required. Follow the current Expo device instructions for this SDK. Expo Go in the App Store may support an older SDK; do not downgrade React Native independently to accommodate it.

An optional `npm run dev:mobile -- --tunnel` setup may require Expo's tunnel dependency and make the development bundle reachable by a tunnel URL. Configure it explicitly when performing device tests; it is not enabled automatically. Never expose secrets through the client bundle.

On a compatible device, verify the Outdoor AI heading, Look. Ask. Play. text, foundation label, readable layout with larger text, and absence of errors. Passing bundle export and Jest does not verify native device behavior.

## Git workflow

The empty repository was initialized with a README. Work on feature/phase-1-foundation; open a PR for review before merging. Main contains reviewed work; develop may be used as an integration branch. Later work uses feature/* or fix/* branches. GitHub Actions validates pushes and PRs. Repository branch protection must be configured separately; this workflow does not imply it is enabled.

Recommended Phase 1 commit: `feat: establish phase 1 foundation`.

## Schema changes

No domain migrations exist in Phase 1. In the phase that adds a model, generate and review a Prisma migration in development, commit the schema and SQL together, and use migrate deploy to apply it in deployed environments. Do not manually edit production schemas.

SDK 57 native iOS builds require Xcode 26.4 or newer; the inspected Mac has 26.3, so native building there requires a later toolchain. Source: https://docs.expo.dev/versions/v57.0.0/ . No local upgrade was performed.

## Dependency overrides

The root package overrides patched transitive dependencies: multer 2.3+, mysql2 3.24.4+, deepmerge-ts 8.0.2+, and UUID 11.1.1+ under xcode. These address npm advisories without downgrading Expo, NestJS, or Prisma. Deepmerge and UUID cross major versions, so Prisma configuration/generation and Expo bundle export are checked with the overrides. Review these overrides when upstream packages update.

The devcontainer uses the documented mcr.microsoft.com/devcontainers/typescript-node:24-bookworm image and its default user. The image was successfully rebuilt in Codespaces.

## Linting

Run `npm run lint` from the repository root. ESLint recommended rules cover JavaScript and TypeScript sources, tests, and configuration. Generated code and build outputs are excluded. CI enforces zero warnings.

## Phase 2

Apply committed migrations with npm run db:deploy after starting PostgreSQL. See [Phase 2](phase-2.md) for account/profile endpoints, mobile API configuration, and testing. The Phase 1 no-domain-model statements above describe the earlier baseline.
