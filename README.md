# Toyota Wars Monorepo

pnpm + Turborepo monorepo containing the Toyota Wars game client, a shared API client package, and a backend API server.

## Layout

```
.
├── apps/
│   ├── toyota-wars/   # Next.js 16 + React 19 + React Three Fiber game client
│   └── server/        # Express API server ("api") — Drizzle ORM, missions/catalog/tanks
├── packages/
│   └── client/        # @toyota/client — generated API types, axios instance, React Query hooks
├── turbo.json         # Turborepo task pipeline (build, check-types, dev)
└── package.json       # Root workspace manifest (apps/*, packages/*)
```

## Apps

### `apps/toyota-wars` — game client

Next.js app housing the tank combat game. Key internals:

- `app/` — Next.js routes
- `feature/` — React components (`scene/`, `vehciles/`, `combat/`, `context/`, `effects/`, `missions/`, `three/`)
- `lib/` — pure game logic: `aim/`, `combat/`, `movement/`, `selector/`, `squad/`, `tanks/`, `weapons/`, `fx/`, `missions/`, `map/`, `difficulty/`
- `docs/` — architecture notes for the selector, squad, and utility systems

See `apps/toyota-wars/ARCHITECTURE.md` (inside the app) for the game's internal architecture.

### `apps/server` — API server

Express + TypeScript backend (`name: "api"`) exposing missions, game catalog and tank blueprints with Drizzle ORM. Includes vitest unit/integration suites and drizzle-kit migrations.

### `packages/client` — `@toyota/client`

Shared client SDK for the API: generated OpenAPI/Zod types (`src/api/generated/`), axios instance, and TanStack Query hooks. Types are generated from the server's `/api-docs.json`.

## Getting started

Requires Node 20+ and pnpm 8.5+.

```bash
pnpm install
```

Run a single app from its directory:

```bash
cd apps/toyota-wars && pnpm dev   # game client
cd apps/server && pnpm dev        # API server
```

## Turborepo tasks

Defined in `turbo.json`:

| Task          | Depends on     | Notes                        |
| ------------- | -------------- | ---------------------------- |
| `build`       | `^build`       | outputs `.next/**`           |
| `check-types` | `^check-types` | typecheck across packages    |
| `dev`         | —              | persistent, uncached         |

```bash
pnpm turbo run build         # build all packages in dependency order
pnpm turbo run check-types   # typecheck everything
pnpm turbo run dev           # run all dev servers
pnpm turbo run dev --filter=toyota-wars   # run just the game
```
