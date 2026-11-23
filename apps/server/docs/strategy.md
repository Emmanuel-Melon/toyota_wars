# Strategy: coordinated squad AI + mission-driven directives

Status: **Phase 5 complete; manual runtime checks pending**. Work on a phase begins only after that phase is explicitly approved. Approval is recorded in the [approval log](#approval-log).

## Problem

Today the squad layer produces advice, not authority:

```
SquadOrchestrator.update()
  ├─ allocateTargets()                       → per-unit target ids
  ├─ telemetry                               → SquadMemberTelemetry[]
  ├─ MesoEvaluator.evaluateTacticalAdaptation()
  │    └─ { adaptedDirective, fireteamTactic }   ← fireteamTactic dropped
  ├─ SquadManager.evaluateSquad(adaptedDirective)
  │    └─ per-unit { directive, assignedRole, formationType, ... }
  └─ publish → squadOrders map

AIVehicle → TankContext.squadOrder → UtilitySelector
  ├─ scoreOptions()  scores every intent identically for every unit
  └─ chooseOption()  picks highest (momentum/commit applies)
```

Consequences: `artillery_support` can pick `flank`; flankers decide independently so coordinated flanks never form; `GENERAL_RETREAT` does not stop individual attacks; the meso `fireteamTactic` has no consumer; missions only set a static `initialOrder` at spawn and never steer the squad afterward.

## Verified facts / corrections to the original sketch

- Role type is `TacticalRole` (`lib/squad/squad.types.ts:22`), not `SquadRole`. Values: `vanguard | suppress | flank | support | artillery_support`.
- `TankContext.squadOrder` is non-optional (`lib/tanks/tanks.types.ts:150`; fallback `NO_SQUAD_ORDER` at `feature/vehciles/ai-vehicle.tsx:61-72`).
- There is no `ctx.isRetreating`. Closest equivalents: `ctx.retreatActive` (per-tank damage timer, `tanks.types.ts:134`) and `ctx.routed` (squad-level loss, handled by `ROUT_TREE` before the selector, `lib/tanks/tanks.trees.ts:30`).
- There is no `SQUAD_DIRECTIVE.FOLLOW_LEADER` (only `TANK_INTENT.FOLLOW_LEADER`). `SQUAD_DIRECTIVE` values: `advance | hold | flank | fightingRetreat | generalRetreat`.
- Consideration gating already works: a zero factor makes `raw = 0` (`lib/selector/scoring.ts:16-17,37-40`); vetoed options get no commit, no momentum, and no fallback (`lib/selector/selector.ts:28,41-43`; `lib/selector/node.ts:53-55`). `patrol` has a constant 0.1 baseline, so the selector never fully stalls.
- Existing `localEnemiesCount` (`lib/squad/squad.orchestrator.ts:116-118`) filters with a global boolean that ignores the element: the count is either every enemy on the map or zero. `closestEnemyDist` only covers allocated targets. This makes the counter-ambush superiority ratio meaningless.
- `lib/tanks/meso/meso.evaluator.ts:27-47` returns `ADVANCE + COUNTER_AMBUSH` when `closestEnemyDistance <= 180`, `allies/enemies >= 1.2`, `avgHealth >= 0.35`; `SquadManager` can still re-escalate that to `GENERAL_RETREAT` (`lib/squad/squad.core.ts:54-60`).
- Mission data today has only `destroyCount`, `destroySquad`, `survive`, `keepAlive` objectives; no points, radius, duration, spatial zones, `activeObjective`, or per-squad directive after spawn (`lib/missions/missions.types.ts:79-133`, `missions.runner.ts:286-327`).
- Mission `Vec2` is `{ x, z }`; squad `Point2D` is `{ x, y }` where `y = worldZ` (`docs/squad.md:122`). Convert explicitly.
- No lint/typecheck/test scripts or `*.test.*` files exist. Use `npx tsc --noEmit` and `npm run build`.

## Decisions locked in

| Topic | Decision |
| --- | --- |
| Gate strictness | Minimal: FLANK on `flank` directive + `flank` role; ATTACK vetoed under `GENERAL_RETREAT`; RETREAT on retreat directives or `ctx.retreatActive`. No full role allow-list (artillery_support may still ATTACK). |
| fireteamTactic | Plumb into `SquadOrderContext` and consume by vetoing RETREAT under `COUNTER_AMBUSH`. |
| Missions | Extend the mission schema with spatial objective types (`capture`, `defend`, `reach`, `escort`), points/radii/seconds, and an active objective. |
| Escort/defend directive | Map to `HOLD` plus a mission target; do not add a `FOLLOW_LEADER` squad directive. |
| Forced intent | `deriveDirective` sets it (defend/escort → `TANK_INTENT.FOLLOW_LEADER`); selector short-circuits on it. |
| Objective ownership | Spatial objectives carry `squadId`; active objective is exposed per squad and passed through `SquadShared`. |
| Completion rules | `reach`/`capture`: any owned unit enters radius. `defend`/`escort`: owned unit stays within radius for `seconds`; escort point is static `Vec2`. |
| Position source | New Canvas bridge inside `BattleProvider` pushes live registry positions into `MissionRunner` each frame. |

---

## Phase 1 — Intent gating + tactic consumer

**Do not begin until approved.**

Goal: squad directive/role/tactic become constraints on intent choice, not hints.

- [x] `lib/intents/intent.utils.ts`: add `gatedOn<C>(name, predicate)`, `whenRole(...TacticalRole[])`, `whenDirective(...SquadDirective[])`, `whenTactic(...FireteamTactic[])`; each returns a `Consideration` with `input: 0|1` and `curve: curves.step(1)`.
- [x] `lib/intents/options/flank.ts:15-35`: add `whenDirective(SQUAD_DIRECTIVE.FLANK)` + `whenRole("flank")`; delete the unreachable `SOLO_FLANK_WEIGHT` branch.
- [x] `lib/intents/options/attack.ts:17-29`: retire `ASSAULT_ROLE_BONUS = 1.3` and the `hasSquadRole` branch; keep the `directSuppression`/`canFire` weight; add `notRetreating` gate on `GENERAL_RETREAT`.
- [x] `lib/intents/options/retreat.ts:23-39`: gate on retreat directives **or** `ctx.retreatActive`; add veto for `FIRETEAM_TACTIC.COUNTER_AMBUSH` (via `whenNotTactic`; active from Phase 2 onward).
- [x] Confirm direct-fire units under FLANK still get roles from `squad.core.ts:135-149`, so the flank gate is satisfiable.
- [x] Run `npx tsc --noEmit` — passed.

Acceptance: no FLANK outside `flank` directive + `flank` role; no ATTACK under `GENERAL_RETREAT`; no RETREAT under COUNTER_AMBUSH; wounded tanks can still retreat under attack directives.

---

## Phase 2 — FireteamTactic plumbing

**Do not begin until approved.**

Goal: meso output stops being dead data.

- [x] `lib/squad/squad.types.ts:25-36`: add `fireteamTactic: FireteamTactic` to `SquadOrderContext` (type-only import from `lib/tanks/meso/meso.types.ts`).
- [x] Pass `fireteamTactic` through `EvaluateSquadParams` (`lib/squad/squad.core.ts:16-23,68-83`) from `mesoResult` (`lib/squad/squad.orchestrator.ts:132-140`); every published order carries it.
- [x] `feature/vehciles/ai-vehicle.tsx:61-72`: add `fireteamTactic: FIRETEAM_TACTIC.HOLD_FORMATION` to `NO_SQUAD_ORDER`.
- [x] Simplify `tacticOf` in `lib/intents/intent.utils.ts` now that the field is required; sync `docs/squad.md:110-134`.
- [x] Run `npx tsc --noEmit` — passed.

Acceptance: every `SquadOrderContext`, including the neutral fallback, has a tactic; the Phase 1 ambush veto can read it.

---

## Phase 3 — Fix meso telemetry inputs

**Do not begin until approved.**

Goal: counter-ambush gates receive real local data.

- [x] `lib/squad/squad.orchestrator.ts`: import `MESO_CONFIG` from `lib/tanks/meso/meso.config.ts`.
- [x] Replace `localEnemiesCount` filter at lines 116-118 with a count of distinct enemies within `MESO_CONFIG.localAwarenessRadius` of at least one squad unit.
- [x] Change `closestEnemyDist` to the minimum distance from any squad unit to any enemy in `enemyTargets`, not just allocated targets; keep `primaryTargetPos` from allocations.
- [x] Keep target allocation intact; only telemetry math changes.
- [x] Run `npx tsc --noEmit` — passed.

Acceptance: no global-boolean filter remains; count is 0 when no enemy is near and equals the number of genuinely nearby enemies otherwise.

---

## Phase 4 — Mission schema, evaluators, and position bridge

**Do not begin until approved.**

Goal: missions can author spatial objectives whose completion is evaluated from live unit positions.

- [x] `lib/missions/missions.types.ts:79-133`: add `CAPTURE`, `DEFEND`, `REACH`, `ESCORT` to `OBJECTIVE_TYPE` and `OBJECTIVE_KIND` (all `goal`).
- [x] Add discriminated objective params: `{ squadId, point: Vec2Schema, radius, seconds? }` (`seconds` required for DEFEND/ESCORT); normalized `MissionObjective` + `toMissionObjective()`.
- [x] Extend `MissionSchema.superRefine` (`:258-269`) to validate new `squadId` references and in-arena `point` values.
- [x] `lib/missions/missions.objectives.ts:20-49`: extend `ObjectiveContext` with `positions(squadId)` and `holdSeconds(objectiveId)`; add optional `isHolding?` hook to `ObjectiveEvaluator`.
- [x] Add evaluators for the four new types: reach/capture → complete when any owned unit is inside radius; defend/escort → complete when `holdSeconds >= seconds`.
- [x] `lib/missions/missions.runner.ts`: accept positions from the bridge, keep a per-objective hold map reset when the condition lapses, and expose `positions(squadId)` to evaluators.
- [x] Select `activeObjective` (first pending required goal, normalized to `MissionObjective`) and add it to `MissionSnapshot`.
- [x] `feature/scene/scene.tsx:53-68`: widen `MissionContext.Provider` to wrap `MissionClock` **and** `BattleProvider`/vehicle trees.
- [x] Add `feature/missions/mission-position-bridge.tsx` inside `BattleProvider` using `useBattle().registry.all()`; push `{ id → { x, z } }` into the runner each frame at priority `-4` (before orchestrator `-3`).
- [x] Author `secure-the-crossroads` mission in `lib/missions/missions.data.ts` to exercise capture → defend sequencing.
- [x] Run `npx tsc --noEmit` — passed; `npm run build` — passed.

Acceptance: a mission with a capture/defend/reach/escort objective validates, tracks live positions, and flips objective status using the chosen rules.

---

## Phase 5 — Strategic layer, forced intent, and wiring

**Do not begin until approved.**

Goal: active mission objective becomes the squad's base directive and target; scripted override available.

- [x] New `lib/strategic/missions.strategic.ts`: `MissionObjective`, `StrategicState`, `deriveDirective(objective, squadCenter, strengthRatio) → { directive, target, forcedIntent }`.
  - [x] capture/reach: inside radius → `HOLD + target`, otherwise `ADVANCE + target`.
  - [x] defend/escort: `HOLD + target`, `forcedIntent = TANK_INTENT.FOLLOW_LEADER`.
  - [x] eliminate: `strengthRatio > 1.2` → `ADVANCE`, else `HOLD`; no target.
  - [x] null objective: `HOLD`, no target, no forced intent.
- [x] `lib/selector/node.ts:8-16`: add optional `forcedIntent?: (ctx: C) => Id | undefined` to `UtilitySelectorConfig` (config lives in `node.ts`, not `types.ts`).
- [x] `lib/selector/node.ts:39-68`: if the hook returns an id present in `children`, evaluate that child directly; otherwise normal scoring; `ROUT_TREE` still runs first.
- [x] `lib/tanks/tanks.trees.ts`: wire the hook to `ctx.squadOrder.forcedIntent`.
- [x] `lib/squad/squad.orchestrator.ts`: add `objectiveTarget` and `forcedIntent` to `SquadTickState`; use `state.objectiveTarget ?? primaryTargetPos` for `targetPosition` (convert `{x,z}` → `{x,y:z}`); publish `forcedIntent` into orders.
- [x] `feature/squad/squad-vehicles.tsx`: extend `SquadShared` with the active objective and `isExplicitOrder`; filter by objective team/squad; compute squad center from live units and `strengthRatio` from local allies/enemies within `MESO_CONFIG.localAwarenessRadius`; derive base directive and pass it to `SquadOrchestrator`.
- [x] `feature/vehciles/ally-vehicles.tsx`: player-issued directive wins; otherwise mission-derived directive; pass `isExplicitOrder`.
- [x] `feature/vehciles/opponent-vehicles.tsx`: mission objective is filtered by team/squad; squads without a matching objective keep their initial order (avoids sending enemies to ally objectives).
- [x] Run `npx tsc --noEmit` and `npm run build` — both passed.

Acceptance: capture sends allies toward the objective and holds on arrival; defend/escort keeps formation near the point via forced follow; player override still works; `ROUT_TREE` still outranks forced intent.

---

## Final verification (after all phases)

- [x] `npx tsc --noEmit`
- [x] `npm run build`
- [ ] Dev run with DevTools console: `createUtilityDebug` (`lib/utility/utility.core.ts:15-34`, enabled when `NODE_ENV !== "production"`) logs per-tank `[utility] <unit> -> <intent>` once per second; confirm gates in each directive.
- [ ] Manual HUD checks: FLANK, ADVANCE, GENERAL_RETREAT, and a spatial mission through completion.
- [x] Docs sync: `docs/squad.md`, `docs/selector.md` (no `docs/missions.md` exists; mission → squad flow documented in `docs/squad.md`).

## Risks and deferred items

- A counter-ambush can still be re-escalated to `GENERAL_RETREAT` by `SquadManager`; the tactic veto protects retreat intent, but directive authority otherwise remains macro-level.
- Forced intent bypasses all gates by design; only defend/escort set it.
- No full role allow-list: `artillery_support` remains eligible for ATTACK.
- No test framework exists; verification is typecheck/build plus runtime observation.
- Deferred: new `FOLLOW_LEADER` directive, moving-convoy escort path, unit tests.

## Approval log

| Phase | Approved | Date | Notes |
| --- | --- | --- | --- |
| 1 | yes | 2026-11-17 | Approved and completed: gating helpers + flank/attack/retreat gates, role bonus retired, `tsc --noEmit` clean. |
| 2 | yes | 2026-11-17 | Approved and completed: tactic plumbed via EvaluateSquadParams, fallback default set, retreat veto now active, docs synced, `tsc --noEmit` clean. |
| 3 | yes | 2026-11-17 | Approved and completed: real proximity count + closest distance over all enemies, `MESO_CONFIG` radius, `tsc --noEmit` clean. |
| 4 | yes | 2026-11-17 | Approved and completed: spatial objective schema/evaluators, position bridge, active objective snapshot, demo mission, `tsc --noEmit` + `npm run build` clean. |
| 5 | yes | 2026-11-17 | Approved and completed: strategic directive derivation, forced intent bypass, objective target/owner wiring, `tsc --noEmit` + `npm run build` clean. Manual runtime checks pending. |
