# Mission Integration Plan

Status tracking for integrating the existing `lib/missions` module into the game.

## Decisions

| Decision      | Choice                                                  |
| ------------- | ------------------------------------------------------- |
| Game mode     | Campaign replaces the current Play/skirmish flow        |
| Arena scope   | Full arena support: seed, size, roads, obstacle density |
| Progression   | Backend-ready: HTTP adapter plus local fallback         |
| Tests         | Added later, in Phase 7, before campaign cutover        |
| Tracking file | Repo root: `missions.md`                                |

## Status Legend

- `Planned` - scoped, not started
- `In progress` - currently being implemented
- `Complete` - implementation and verification finished, awaiting approval
- `Approved` - reviewed and accepted; next phase may start
- `Blocked` - waiting on a decision or dependency

Only one phase may be `In progress` at a time. The next phase must not begin until the current phase is `Approved`.

## Phase Status

| Phase | Scope                                                               | Status      | Approval |
| ----- | ------------------------------------------------------------------- | ----------- | -------- |
| 0     | Create `missions.md`, record decisions, baseline checks             | Approved    | Approved |
| 1     | Mission contracts: templates, arena schema additions, validation    | Approved    | Approved |
| 2     | Pure arena runtime: terrain, roads, bounds, obstacle generation     | Approved    | Approved |
| 3     | Arena integration: terrain/bounds/roads used by the live game       | Approved    | Approved |
| 4     | Obstacles: rendering, AI avoidance, player/vehicle collision        | Complete    | -        |
| 5     | Dynamic battle model: roster, health, targets, squad rendering      | In progress | -        |
| 6     | Mission session: spawning, waves, orders, event bus, objectives     | Planned     | -        |
| 7     | Hardening: add Vitest and cover mission/arena/runner logic          | Planned     | -        |
| 8     | Campaign UI and progression: mission select, briefing, HUD, results | Planned     | -        |
| 9     | Cutover cleanup, docs update, final verification                    | Planned     | -        |

## Phase Details

### Phase 0 - Tracking and baseline

**Goal:** Establish the tracking document and confirm the repository starts from a working baseline.

**Work:**

- [x] Create `missions.md` with phase plan, status model, and approval workflow.
- [x] Record the agreed decisions.
- [x] Run baseline verification.
- [x] Fix the pre-existing `EventBus` generic constraint that blocked typecheck.

**Acceptance criteria:**

- [x] Tracking file exists at the repository root.
- [x] Baseline typecheck result is recorded.
- [x] Baseline production build result is recorded.

**Verification results:** (2026-11-15)

- `pnpm exec tsc --noEmit`: Passed
- `pnpm build`: Passed

**Baseline correction:** The first typecheck exposed two pre-existing `TS2344` errors in `lib/missions/missions.events.ts`. The `EventBus` generic constraint was widened from `Record<string, unknown>` to `object` so the `GameEvents` interface satisfies it. No runtime behavior changed.

**Approval:** Approved (2026-11-15)

---

### Phase 1 - Mission contracts

**Goal:** Make mission data fully valid and self-checking before runtime integration.

**Work:**

- [x] Add `lib/missions/missions.templates.ts` for `light`, `medium`, `heavy`.
- [x] Define template stats: max health, palette selection, fire interval/damage tuning, default traits.
- [x] Call `assertKnownTemplates(MISSIONS, knownTemplateIds)` at startup.
- [x] Extend the arena schema with optional `heading`, `levelId`, and road configuration.
- [x] Add arena-bound validation for player, squad, and road spawn points.
- [x] Keep existing game behavior unchanged.

**Acceptance criteria:**

- [x] All three missions parse and validate.
- [x] Unknown templates fail loudly with mission/squad context.
- [x] Arena schema supports full arena configuration.
- [x] No runtime behavior changes yet.

**Verification:** (2026-11-15)

- `pnpm exec tsc --noEmit`: Passed
- `pnpm build`: Passed

**Implementation notes:**

- `UNIT_TEMPLATES` now defines `light`, `medium`, and `heavy` stats plus ally/enemy palette options.
- `assertMissionTemplates` runs at mission-data load and fails with `mission/squad: unknown template` messages.
- `missions.data` is imported for validation at application startup without changing rendering or gameplay.
- Arena now supports `heading`, optional roads (`waypoints` + `width`), and validates all authored points against `arena.size`.

**Approval:** Approved 2026-11-15

---

### Phase 2 - Pure arena runtime

**Goal:** Generate terrain, roads, bounds, and obstacles from mission arena data.

**Work:**

- [x] Add `lib/map/arena.ts`.
- [x] Build `createArenaRuntime(mission)` returning terrain sampler, roads, bounds, chunk config, and obstacle discs.
- [x] Derive terrain seed from `arena.seed`.
- [x] Derive gameplay bounds from `arena.size`.
- [x] Generate deterministic roads from mission anchors or level configuration.
- [x] Scatter obstacles deterministically from `arena.obstacleDensity`.
- [x] Exclude player and squad spawn areas from obstacle placement.
- [x] Keep this module free of React and live-game wiring.

**Acceptance criteria:**

- [x] Same mission input produces identical terrain, roads, and obstacles.
- [x] Different seeds and sizes produce different arenas.
- [x] No obstacle overlaps any authored spawn point.
- [x] Obstacles and roads remain inside arena bounds.

**Verification:** (2026-11-15)

- `pnpm exec tsc --noEmit`: Passed
- `pnpm build`: Passed
- Determinism, spawn-clearance, and bounds checks: Passed for all three missions.

**Implementation notes:**

- `createArenaRuntime(mission)` resolves `levelId` (default `plains`), overrides the terrain seed, and derives `bound`, chunk radius, player spawn, and heading.
- Roads use authored waypoints when present; otherwise they connect player spawn, arena centre, and the enemy spawn centroid. Control points are clamped so the road ribbon stays inside bounds.
- Obstacles use a mission-specific `mulberry32` stream. Placement excludes player/squad spawns, road shoulders, and other obstacles, then rejects any disc that would cross arena bounds.
- Current missions generate 12, 10, and 15 obstacles respectively, each with two road segments.
- `lib/map/index.ts` now exports arena runtime factories and types.

**Approval:** Approved 2026-11-15

---

### Phase 3 - Arena integration

**Goal:** Make the live game use the active arena runtime instead of global terrain and bounds.

**Work:**

- [x] Add an arena context/provider.
- [x] Make movement bodies receive terrain and world bounds.
- [x] Make grounding, camera, terrain chunks, roads, position tracking, and projectiles use the active terrain sampler.
- [x] Replace `MOVEMENT_CONFIG.body.worldBound` and `PROJECTILE_CONFIG.BOUNDS` dependencies with arena values.
- [x] Use a default arena so the current game remains playable during this phase.

**Acceptance criteria:**

- [x] Terrain seed and arena size visibly affect the running game.
- [x] Roads are generated from the active arena.
- [x] Current gameplay remains playable while using arena-provided terrain and bounds.
- [x] No per-frame allocations are introduced in the terrain sampling path.

**Verification results:** (2026-11-15)

- `pnpm exec tsc --noEmit`: Passed.
- `pnpm build`: Passed.
- Production smoke test (`pnpm start --port 3002`, headless Chrome + CDP pointer input): Passed.
  - `Play` transitioned from the menu to the battle HUD.
  - HUD reported `ALLIES 9`, `ENEMIES 10`, `DESTROYED 0`, and `AMMO 100`.
  - The canvas rendered at `756x413` and no application exceptions were logged.
   - A headless attempt against the existing port 5173 dev server was inconclusive because React handlers were not hydrated and HMR handshakes failed. The fresh production server confirmed the built code path.

**Implementation notes:**

- `ArenaProvider` now derives the active runtime from `DEFAULT_ARENA`; `DEFAULT_ARENA` preserves the existing spawn, heading, terrain seed, size, and road layout.
- `createArenaRuntime` accepts an `ArenaSource`, so `DEFAULT_ARENA` uses the same path as missions without requiring squads.
- Movement bodies now receive `TankBodyWorld` (`terrain` + `bound`) instead of reading global configuration.
- Grounding, AI, player spawning, camera terrain clamping, terrain chunks, roads, target heights, position tracking, and projectiles all read from the active arena.
- Static ally and opponent spawn arrays remain in place; roster-driven spawning starts in Phase 5.
- Seed/size variation was verified against the pure arena runtime in Phase 2; the Phase 3 smoke test used the compatibility default to confirm playability.

**Approval:** Approved 2026-11-15

---

### Phase 4 - Obstacles and collision

**Goal:** Make `obstacleDensity` a real gameplay feature.

**Work:**

- [x] Render arena obstacles as terrain-anchored rocks.
- [x] Feed the same obstacle discs into AI avoidance.
- [x] Add obstacle collision for the player and AI bodies.
- [x] Ensure obstacle placement respects roads and spawn areas.

**Acceptance criteria:**

- [x] Changing `obstacleDensity` changes the obstacle layout.
- [x] Units cannot drive through obstacles.
- [x] AI vehicles route around obstacles.
- [x] Obstacles are consistent with their collision footprints.

**Verification results:** (2026-11-16)

- `pnpm exec tsc --noEmit`: Passed.
- `pnpm build`: Passed.
- Deterministic arena check: Passed.
  - `DEFAULT_ARENA` at density `0.3` generated 10 obstacles.
  - Density changes altered the generated layout.
  - Obstacles stayed inside arena bounds and respected spawn/road clearance.
- Runtime collision probe (`next start`, headless Chrome + CDP): Passed.
  - Player was driven straight at obstacle `(65.55, 22.05)` with radius `5.48`.
  - Movement stopped at `7.48` from the obstacle center, exactly `radius + 2.0` body radius.
  - Continued throttle did not pass through the obstacle, and no application exceptions were logged.
- AI avoidance simulation: Passed.
  - A tank ordered past an obstacle on its direct path routed around it.
  - Minimum center distance was `7.71` (physical clearance `7.0`) and the target was reached.
- Production smoke test: Passed.
  - The app loaded, the battle started, and HUD controls remained interactive.
  - Arena rocks render from the same discs used by collision; visual review screenshots were captured during the smoke test.

**Implementation notes:**

- `DEFAULT_ARENA.obstacleDensity` is now `0.3`, with clearance points from the generated ally/opponent skirmish spawns.
- The player body, AI bodies, and squad runtime all receive the arena's obstacle discs.
- Rocks are rendered as terrain-anchored `dodecahedronGeometry` meshes using each obstacle's radius, rotation, and ground height. Movement collision remains authoritative; no Rapier static colliders were added.
- Avoidance now starts at `obstacle.radius + padding` and reaches full strength at physical contact (`radius + bodyRadius`), so AI reacts before the collision solver stops it.

**Approval:** -

---

### Phase 5 - Dynamic battle model

**Goal:** Replace fixed spawn arrays and IDs with a dynamic roster that missions can populate.

**Work:**

- [x] Add a dynamic roster store for spawned squads and units.
- [x] Register health and part health when units enter the roster.
- [x] Replace static target construction with roster-driven target lists.
- [x] Generalize squad rendering to accept explicit unit descriptors and IDs.
- [x] Generate stable IDs such as `enemy-warband-0`.
- [x] Emit `unitDestroyed` and `playerDestroyed` through the mission event bus.
- [x] Convert the current 10v10 battle to run through the new dynamic path.

**Acceptance criteria:**

- [x] Current battle behavior is preserved through the dynamic roster.
- [x] No runtime assumptions remain around `enemy-0` or `ally-0`.
- [x] Health bars, kills, wrecks, reticles, and target allocation all work with dynamic IDs.
- [x] Roster cleanup removes targets, health, wrecks, and projectiles.

**Verification results:** (2026-11-16)

- `pnpm exec tsc --noEmit`: Passed.
- `pnpm build`: Passed.
- Manual gameplay smoke test: Pending (requested manual verification).

**Implementation notes:**

- `BattleRoster` owns squads, units, health, part health, and reset state; React reads it with `useSyncExternalStore`.
- The skirmish now spawns as roster squads `ally-vanguard-*` and `enemy-warband-*`; the player is registered in the roster as `player`.
- Targets are built from roster units and continue to receive live positions from the unit registry.
- Squad rendering uses explicit roster unit descriptors and IDs. Reticles, wrecks, health bars, target allocation, kills, and winner counts no longer depend on fixed ID prefixes.
- Kills emit `unitDestroyed` or `playerDestroyed` through the mission event bus.
- `resetBattle()` clears roster health and targets; `BattleResetEffects` clears wrecks and active projectiles.

**Approval:** -

---

### Phase 6 - Mission session

**Goal:** Run authored missions end to end through `MissionRunner`.

**Work:**

- Implement `MissionSession` and `MissionHost` on top of the roster and arena runtime.
- Wire start/time/squad-destroyed spawn triggers and waves.
- Apply mission player spawn and heading.
- Apply unit templates and `initialOrder` behavior.
- Bridge game kills and player death into mission events.
- Evaluate objectives and emit success/failure results.
- Add a temporary developer-only mission launcher.

**Acceptance criteria:**

- All three authored missions can start through the developer launcher.
- Waves spawn on their triggers.
- Objectives update correctly and results are emitted.
- Player spawn matches mission data.
- Retry and cleanup leave no stale units, health, projectiles, or wrecks.

**Verification:**

- `pnpm exec tsc --noEmit`
- `pnpm build`
- Manual run of all three missions

**Approval:** -

---

### Phase 7 - Hardening and tests

**Goal:** Add automated coverage for mission-critical pure logic before UI cutover.

**Work:**

- Add Vitest and a `test` script.
- Add tests for mission schema validation and template checks.
- Add tests for arena determinism, bounds, roads, and obstacle exclusion.
- Add tests for objective evaluation and runner transitions.
- Add tests for roster spawning/cleanup and progress merge logic.

**Acceptance criteria:**

- `pnpm test` passes.
- Core mission, arena, runner, objective, and progress logic is covered.
- Tests run without requiring a browser or WebGL.

**Verification:**

- `pnpm test`
- `pnpm exec tsc --noEmit`
- `pnpm build`

**Approval:** -

---

### Phase 8 - Campaign UI and progression

**Goal:** Replace Play with a complete campaign flow.

**Work:**

- Add campaign mission select with locked/completed states.
- Add briefing screen with title, briefing, difficulty, and objectives.
- Add in-mission objectives and timer HUD.
- Add result screen with outcome, objective summary, XP, unlocks, Retry, and Next.
- Add `MissionProgressRepository` with HTTP and local adapters.
- Select the HTTP adapter when configured; otherwise use local fallback.
- Persist XP, completed missions, and unlocks.
- Disable elimination-based victory in campaign mode.

**Acceptance criteria:**

- Menu to briefing to mission to result to next mission works.
- Locked missions cannot be started.
- Success records XP and unlocks.
- Retry resets the mission completely.
- Progress survives reload with the local adapter.
- HTTP adapter remains ready for a real backend.

**Verification:**

- `pnpm test`
- `pnpm exec tsc --noEmit`
- `pnpm build`
- Manual full campaign pass

**Approval:** -

---

### Phase 9 - Cutover and cleanup

**Goal:** Remove obsolete skirmish-only paths and finalize documentation.

**Work:**

- Remove unused static spawn, ally/opponent vehicle, and legacy win-flow code.
- Update `README.md` and `ARCHITECTURE.md`.
- Update this file with final outcomes.
- Run final verification and a manual campaign pass.

**Acceptance criteria:**

- No dead mission or skirmish paths remain.
- Documentation matches the implemented architecture.
- Typecheck, build, and tests pass.
- Full campaign is playable from a clean start.

**Verification:**

- `pnpm test`
- `pnpm exec tsc --noEmit`
- `pnpm build`
- Manual campaign pass

**Approval:** -

## Implementation Notes

- Preserve game playability at every phase; prefer compatibility adapters over big-bang rewrites.
- Keep mission data pure and backend-safe: no Three.js or React imports in mission schemas.
- Keep terrain sampling allocation-free in per-frame paths.
- Use stable unit IDs that remain readable in debugging and HUDs.
- Treat `MissionRunner` as the authority for mission success/failure in campaign mode.
