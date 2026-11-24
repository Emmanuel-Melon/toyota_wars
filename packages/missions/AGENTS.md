# AGENTS.md

## Workspace

- This directory is `@toyota/missions`, a private, source-only package inside the pnpm/Turbo workspace at `../..`.
- It owns the canonical mission schema, validation, engine, runner, snapshots, and neutral direction views.
- It may depend only on `@toyota/ai` (`workspace:*`) and `zod`. Do not import from `apps/*`, `@/*`, React, Three.js, app state/context, Express, Drizzle, or server code.
- Mission data, flow scripts, cutscenes, QTEs, camera behavior, and UI stay in `apps/toyota-wars`; server persistence is separate and does not consume this package yet.
- No build step: `main`, `types`, and `exports` all point at `src/index.ts`.

## Commands

- `pnpm check-types`, `pnpm test` (Vitest with colocated `*.test.ts`), `pnpm format`.
- From the root: `pnpm turbo run test check-types --filter=@toyota/missions`.
- No lint or build script exists. Prefer focused `pnpm exec prettier --write <files>` over `pnpm format`, which rewrites all of `src`.
- Use `src/test-fixtures/mission.ts` (`makeMissionInput`, `makeMission`) as the canonical fixture.

## Architecture

- `src/index.ts` is the public surface; add new public modules there deliberately and do not expose test fixtures or internal helpers by default.
- `missions.config.ts` sits at the bottom of the dependency graph and has no imports; add new tags there and derive unions from its `as const` tables instead of ad-hoc strings.
- `missions.schema.ts` owns Zod structure and defaults; `missions.validation.ts` owns cross-reference, bounds, layout, and winnability rules. Use `MissionInput`/`SquadEffectInput` for authoring and `Mission`/`SquadEffect` for parsed values.
- Objectives, spawn triggers, squad effects, and fail conditions are discriminated unions. Adding an objective means updating config/kind mapping, schema, validation, evaluator registry, neutral needs in `direction/mission-state-view.ts`, HUD/navigation mapping in `direction/mission.hud.ts`, and tests.
- `engine/mission.run.ts` owns mutable `MissionRun` state. `engine/mission.reducer.ts` mutates that run and returns `{ effects, changed }`; it must not call host systems.
- `runtime/mission.runner.ts` is the external store and only effect executor: it loads missions, drives updates, subscribes to game events, and publishes immutable `MissionSnapshot`s.
- `host/mission.host.ts` is the only game seam: arena setup, spawning, cleanup, player health, and optional unit positions belong behind `MissionHost`.
- `direction/` builds neutral, frozen views; directive derivation lives in `@toyota/ai` and is only re-exported here. The app adapts neutral directives into app-specific tactics.
- `createMissionsRegistry()` is a generic factory. The app wraps it with flow/tutorial data; do not restore a static package registry or hand-maintained catalog.

## Gotchas

- `Vec2` is `{ x, z }` in world units relative to arena center; other layers may use `{ x, y }`. Convert at the host boundary.
- Mission and zone ids match `^[a-z0-9-]+$`; authored schema version is `2`.
- Presets are functions so each squad gets fresh arrays. Parsed squads always have effect lists, so engine code should not add fallbacks.
- Objective kinds matter: goals can complete a mission, required goals are needed to win, constraints can only fail, and unresolved constraints complete when the mission succeeds.
- Snapshot/view objects are intended to be immutable; compare directives with `directivesEqual`, not object identity.
- Progress is quantized to two decimals, and snapshots are published only on meaningful changes, performed effects, second boundaries, or directive changes.
- Two position bridges exist: optional `MissionHost.getUnitPositions()` and the module-level store in `helpers/mission-unit-positions.ts`. Clear or replace global positions on reset/load.
- Rename/rehome comments in older files may be stale; trust the current package layout.
