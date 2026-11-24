# AGENTS.md

## Workspace

- This directory is `@toyota/models`, a private, source-only package inside the pnpm/Turbo workspace at `../..`.
- It contains pure R3F visual components and visual helpers. Do not import from `apps/*`, `@/*`, `@toyota/agents`, or any app state/context.
- No build step: `main`, `types`, and `exports` all point at `src/index.ts`.
- React, Three.js, and `@react-three/fiber` are peer dependencies supplied by the host app.

## Agent constraints

- The agent shall only write code. All scripts are run manually by the user — dev servers, builds, typechecks, tests, linting, formatting, codegen, DB setup/migrations, and seeders. Command sections below are reference only.

## Commands

- `pnpm check-types`, `pnpm format`.
- From the root: `pnpm turbo run check-types --filter=@toyota/models`.
- No lint or test script. Prefer focused `pnpm exec prettier --write <files>` over `pnpm format`.

## Architecture

- `src/index.ts` is the public surface and exports the `Vehicle`, `Weapons`, and `Environment` namespaces from `src/vehicle`, `src/weapons`, and `src/environment`.
- Each domain (`src/vehicle/`, `src/weapons/`, `src/environment/`) has its own barrel and namespace export. Future sibling domains follow the same pattern.
- Within `src/vehicle/`, `config/` holds visual-only dimensions and mount constants.
- Within `src/weapons/`, `components/` holds pure weapon mount visuals.
- Within `src/environment/`, `chunks.ts` holds chunk math, `geometry/` holds terrain/rock/road geometry, `textures/` holds procedural canvas textures, `materials/` holds terrain materials, and `components/` holds R3F leaf visuals.
- `src/environment/types.ts` defines neutral visual contracts that are structurally compatible with app terrain, road, obstacle, structure, and location types. Do not import app types.
- `geometry/`, `materials/`, and `textures/` hold pure visual helpers with no app imports.
- `components/` holds R3F leaf parts. Components accept explicit props and optional slots; they never read app contexts, game-frame hooks, combat state, weapon config, or damage state.
- Damage detachment, health bars, smoke/effects, physics, aiming, recoil, audio, mission layout, terrain generation, road-network generation, arena placement, and weapon configs stay in the app and are passed into package components as slots or refs.
- Environment frame orchestration and camera/streaming focus selection stay in the app. Package environment components take explicit focus/center props or expose imperative handles.
- Do not add `@react-three/drei` or `@react-three/rapier` dependencies; sky/lighting and colliders stay in the app.

## Gotchas

- Callers use `Vehicle.X`, `Weapons.X`, and `Environment.X` from `@toyota/models`; do not add named re-exports to `src/index.ts`.
- `WeaponMountKind` is a neutral visual union; it is structurally compatible with the app's weapon mount ids.
- Muzzle effects are app-owned and passed into `Vehicle.BedMount` as slots.
- Geometry created with `useMemo` is disposed in `useEffect` cleanup.
- Keep `feature/vehciles` misspelled in the app; this package uses correct spelling only inside its own paths.
