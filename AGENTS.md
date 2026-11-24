# AGENTS.md

## Workspace

- pnpm + Turborepo. Root has no `packageManager` pin; `apps/toyota-wars` pins pnpm@12.3.4; README requires Node 20+.
- `apps/toyota-wars` (`toyota-wars`): Next.js 16/R3F game on port 5173. `apps/server` (`api`): Express + Drizzle/Postgres on port 3000.
- `packages/*` are private/source-only (`types`/`exports` -> `src/index.ts`, no build step): `ai` (pure decisions) -> `agents` -> app; `missions` depends on `ai`; `client` is an HTTP-only SDK; `models` is pure R3F visuals with peer deps.
- Packages must not import from `apps/*`; new workspace packages used by the game must be added to `next.config.mjs` `transpilePackages`.
- Nested instructions: `apps/toyota-wars/AGENTS.md`, `packages/{agents,ai,client,models}/AGENTS.md`.

## Agent constraints

- The agent shall only write code. All scripts are run manually by the user — dev servers, builds, typechecks, tests, linting, formatting, codegen, DB setup/migrations, and seeders. Command sections below are reference only.

## Commands (from root)

- `pnpm install`; `pnpm turbo run dev --filter=toyota-wars` / `--filter=api`.
- `pnpm check-types` covers only packages, not `toyota-wars` or `api`: also run `pnpm --filter toyota-wars exec tsc --noEmit` and `pnpm --filter api exec tsc --noEmit`. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so app builds can pass with type errors.
- `pnpm lint` is a no-op (no workspace defines lint). `pnpm test` covers api/agents/ai/missions only (`pnpm test:api` is the API shortcut). Single API unit test: `pnpm --filter api exec vitest run <file> --config vitest.config.ts`. `test:integration` currently has no matching `*.controller.test.ts` and references a missing setup file; it needs `.env.test`/DB.
- `pnpm generate:api`: emits gitignored `apps/server/openapi.json`, then regenerates `@toyota/client` types. Change server schemas first; never hand-edit `src/api/generated/api.types.ts`. The remote variant needs a running API at `/api-docs.json`.
- Root `pnpm format` rewrites all `**/*.{ts,tsx,md}` with no root config (including generated files); `apps/server/.prettierrc` adds import sorting for server files. Prefer focused `pnpm exec prettier --write <files>` in the owning workspace.

## Gotchas

- `@/*` maps to the app root in `apps/toyota-wars` and to `src` in `apps/server`, not the repo root. `feature/vehciles/` in the app is intentionally misspelled.
- API DB scripts `apps/server/scripts/setup-db.sh` and `setup-test-db.sh` create `toyota_wars_db` / `toyota_wars_test_db` (the test script drops an existing test DB); `.env.example` uses different names (`game`/`game_test`). `drizzle:migrate` reads `.env`, `drizzle:migrate:test` reads `.env.test`; `db:reset` is destructive and uses `.env`. Live docs are `/api-docs` and `/api-docs.json`.
- Docs drift: `ARCHITECTURE.md` and `apps/toyota-wars/AGENTS.md` contain stale claims (no root workspace file, game not using `@toyota/client`, pg-boss/Redis/Stripe infra, old paths/docs, alias to repo root). Verify against manifests/source before following them.
