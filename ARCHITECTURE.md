# Monorepo Architecture

Overview of the Toyota Wars monorepo: how the apps and packages fit together, how they depend on each other, and how Turborepo orchestrates them.

## Workspace topology

```
┌─────────────────────────────────────────────────────────────┐
│                        pnpm workspace                        │
│                                                              │
│   apps/toyota-wars          apps/server        packages/     │
│   (Next.js game client)     (Express API)      client        │
│        │                        │              (@toyota/     │
│        │                        │               client)     │
│        │                        │                  ▲         │
│        │                        │                  │ types / │
│        │                        │                  │ axios / │
│        │                        │                  │ hooks   │
│        └──────── HTTP/JSON ──────┴──────────────────┘         │
│                     ▲                                        │
│                     │ /api-docs.json (OpenAPI)               │
└─────────────────────┼────────────────────────────────────────┘
                      │
            ┌─────────┴──────────┐
            │  PostgreSQL        │
            │  Redis             │
            │  Stripe            │
            │  pg-boss queues    │
            └────────────────────┘
```

### `apps/toyota-wars` — game client

Next.js 16 (App Router) + React 19 + React Three Fiber. Self-contained game code under:

- `lib/` — pure TypeScript game logic, no React: combat, movement, AI (`selector/`, `tanks/`, `squad/`), weapons, map generation, missions, FX bus
- `feature/` — React layer: R3F scene components, HUD, contexts bridging `lib/` state into React
- `app/` — Next.js routes only

Currently **no workspace dependencies** — it does not import `@toyota/client` yet.

### `apps/server` — API server (`api`)

Express + TypeScript backend. Layered structure:

- `src/routes/` — HTTP surface (`api.routes.ts`)
- `src/feature/` — domain modules: `users`, `session`, `missions`, `tanks`
- `src/lib/` — infrastructure: Drizzle ORM schema/seed, pg-boss queues, Stripe, Redis
- `src/middleware/`, `src/config/`, `src/types/`

Persistence: PostgreSQL via Drizzle (migrations under drizzle-kit), Redis via ioredis, Stripe billing, pg-boss background jobs. Tests: vitest unit + integration configs.

### `packages/client` — `@toyota/client`

Typed SDK generated/consumed by frontend apps:

- `src/api/generated/` — OpenAPI types (`openapi-typescript`) and Zod schemas (`openapi-zod-client`) generated from `GET /api-docs.json`
- `src/api/clients/` — axios instance, error handling
- `src/hooks/api/` — TanStack Query hooks, React Query devtools, Sentry

## Dependency direction

```
toyota-wars ──(future)──▶ @toyota/client ──HTTP──▶ api (apps/server)
```

Rules of thumb:

- `packages/` must never import from `apps/`
- `@toyota/client` only talks HTTP to the server — no shared DB access
- Shared game/client types that both sides need should live in `packages/`, not be duplicated

## Turborepo pipeline (`turbo.json`)

| Task          | `dependsOn`     | Purpose                                    |
| ------------- | --------------- | ------------------------------------------ |
| `build`       | `^build`        | Build packages in topological order        |
| `check-types` | `^check-types`  | Typecheck respecting package boundaries    |
| `dev`         | —               | Long-running dev servers, uncached         |

Caching: `build` outputs `.next/**` (excluding cache/dev dirs); `dev` and other tasks are uncached.

## Commands

```bash
pnpm install                              # install all workspaces
pnpm turbo run build                      # build everything
pnpm turbo run check-types                # typecheck everything
pnpm turbo run dev --filter=toyota-wars   # game only
pnpm turbo run dev --filter=api           # server only
```

## Known gaps / next steps

- No `pnpm-workspace.yaml` at root — pnpm falls back to `package.json#workspaces`, which works, but an explicit file is the modern convention
- `apps/toyota-wars` doesn't yet depend on `@toyota/client`; wire it in when the game needs the API (leaderboards, persistence)
- Root `package.json` lacks a `packageManager` pin — `apps/toyota-wars` pins `pnpm@12.3.4` while `devEngines` requests `8.5.0`; pick one
