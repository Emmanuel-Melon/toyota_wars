# AGENTS.md

## Workspace

- This directory is the game client (`apps/toyota-wars`) inside a parent pnpm/Turbo workspace at `../..`.
- Backend lives in `../server` (package name `api`); shared API SDK is `../../packages/client`. The game does not import `@toyota/client` yet.
- App pins `pnpm@12.3.4`. Prefer running commands from this directory; from the monorepo root use `pnpm turbo run dev --filter=toyota-wars`.

## Agent constraints

- The agent shall only write code. All scripts are run manually by the user — dev servers, builds, typechecks, tests, linting, formatting, codegen, DB setup/migrations, and seeders. Command sections below are reference only.

## Commands

- `pnpm dev`, `pnpm build`, `pnpm start`
- Typecheck: `pnpm exec tsc --noEmit`. This is required because `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` can pass with type errors.
- Format focused files with `pnpm exec prettier --write <files>`; `pnpm format` rewrites the whole app. `npx prettier` can fail with `EBADDEVENGINES`.
- No test or lint scripts/CI exist in this app. Backend tests live in `../server`.
- `pnpm build` may warn that Turbopack ignored the parent `package.json`; this is expected.

## Architecture

- Entry flow: `app/page.tsx` -> `game.tsx` -> `game/game-providers.tsx` -> `feature/game/game-view.tsx` -> `render.tsx` -> `feature/scene/scene.tsx` -> `feature/scene/scene-providers.tsx`.
- `game.tsx` owns shell state via `useGameState`; `game/game-providers.tsx` is the single central provider root; `feature/game/game-view.tsx` wires shortcuts and screen resolution; `render.tsx` owns the Canvas and Canvas-local composition; `feature/scene/scene.tsx` composes scene content; `feature/game/` holds hooks, bindings, screens, and the playing HUD.
- `render-loop.tsx` defines `FRAME_PHASES`, `FrameLoopProvider`, `GameLoopDriver`, and `useGameFrame`; Canvas frame work should register with a named phase. Per-entity visual `useFrame` hooks remain local.
- Provider order is `Arena -> Combat -> MissionSession -> CameraMode -> GameRuntime -> Targets -> Player`. `GameRuntime` derives `paused` from combat winner + mission status + mode.
- `feature/scene/scene-providers.tsx` owns the Canvas-local stack: `MissionContext -> MissionClock -> Physics -> PlainsEnvironment -> Quarks -> Fx -> Battle`. Keep `MissionClock` inside `<Canvas>`; keep `SquadProvider`/`VehicleProvider` local to their entities.
- `lib/` is pure game logic (no React); `feature/` is the React/R3F layer; `context/` holds React providers bridging state.
- Contexts currently live in root `context/`. `docs/context.md` and parts of `ARCHITECTURE.md` still reference `feature/context/` and are stale.
- The misspelling `feature/vehciles/` is intentional. `lib/vehicles/` is correctly spelled; do not create a parallel `feature/vehicles/`.
- R3F bridges outer React context into `<Canvas>`; providers in `game/game-providers.tsx` intentionally sit outside the Canvas, while Canvas-local providers live in `feature/scene/scene-providers.tsx`.
- UI flow is menu -> mission-select -> vehicle-select -> playing. `round` is the provider reset key; confirming a vehicle remounts providers, then `MissionLaunchBridge` starts the pending mission.

## Missions

- See [docs/missions.md](./docs/missions.md) for the current system and [docs/missions-plan.md](./docs/missions-plan.md) for the approved directive architecture roadmap.
- Mission definitions live in `lib/missions/data/<id>/`: `mission.ts` owns the `MissionInput`, the `GameMissionBundle` export, and any `FlowScript`; `success.ts` and `failure.ts` hold objectives/fail conditions; `zones.ts` is optional. Do not add placeholder `cutscenes.ts`, `qtes.ts`, `flow.ts`, or per-folder `index.ts`; `lib/missions/data/index.ts` re-exports bundles from `<id>/mission`.
- `lib/missions/missions.init.ts` validates the catalog, asserts templates, and registers every bundle through `lib/missions/missions.registry.ts`. `game.tsx` imports it for that side effect; do not remove that import.
- `MissionsRegistry` comes from `@toyota/missions`; the app facade stores `{ mission, flow?, tutorial? }`. Consumers read missions and flow scripts from `lib/missions/missions.registry.ts`, not from a hand-maintained `MISSIONS` array.
- Pure flow script types live in `lib/mission-flow/mission-flow.types.ts`; `feature/mission-flow/` owns only runtime/store/UI. Add `cutscenes.ts`/`qtes.ts` only when a mission has real camera/QTE steps; `hold-the-line` is the only current example.
- Canonical mission schema/validation lives in `@toyota/missions`; spatial objectives reference `zones[].id`. `MissionRunner` is an external store in `@toyota/missions`; `MissionSessionProvider` maps missions to roster spawns and arena state. Keep `MissionClock` inside `<Canvas>`.
- Mission select hides the tutorial and shows every other mission; `requires` and `rewards.unlocks` are not enforced as progression.
- `MissionSnapshot.activeObjective` is currently consumed by both HUD/navigation and AI. The planned boundary is: objectives are conditions, `MissionState` is the runtime truth, and a pure squad director derives neutral `SquadDirectiveView` data that the AI adapts into tactics.

## Gotchas

- Import alias `@/*` maps to this repo root (`tsconfig.json`).
- `tsconfig.tsbuildinfo` is tracked and changes after typecheck/build; avoid including it in focused commits.
- `render.tsx` uses `shadows="percentage"` intentionally: R3F v9 maps it to `THREE.PCFShadowMap`; boolean `shadows` and `"soft"` select deprecated `PCFSoftShadowMap`.
- The browser `THREE.Clock` deprecation warning is upstream-only from R3F v9 and three.quarks; no app code creates `THREE.Clock`, so do not add a duplicate app-level `Timer` to chase it.
