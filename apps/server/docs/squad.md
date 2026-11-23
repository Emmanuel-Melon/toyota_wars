# Squad Management System

This document describes the squad management system — the layer that coordinates AI vehicles into a fighting force: shared target allocation, macro-layer directives, weapon/vehicle-based role assignment, and the meso-layer tactical adaptation that sits between them.

## Overview

Each team gets one `SquadOrchestrator` that runs once per frame at priority `-3` inside `SquadVehicles`. Per tick it:

1. **Allocates targets** — sticky per-member enemy assignment (`squad.targets.ts`)
2. **Builds telemetry** — health, vehicle platform, mounted weapon, retreat state, position per AI unit
3. **Evaluates the meso layer** — local fireteam adaptation (`lib/tanks/meso/`)
4. **Evaluates the macro layer** — mission-derived directive + role/formation assignment (`SquadManager`)
5. **Publishes results** — target positions and `SquadOrderContext` maps that `AIVehicle`s consume through React context

The active mission objective is converted by `deriveDirective` (`lib/strategic/missions.strategic.ts`) into a base directive, target point, and optional forced intent. Player-issued orders still win for allied squads.

The tank-level utility AI (`docs/selector.md`) then reads `ctx.squadOrder` to weight its intents, closing the loop from squad doctrine down to individual vehicle behavior.

## Architecture

```
lib/squad/
├── squad.registry.ts      # UnitRegistry — live unit state for all teams
├── squad.orchestrator.ts  # SquadOrchestrator — per-team tick pipeline
├── squad.targets.ts       # createTargetAllocator — sticky target assignment
├── squad.core.ts          # SquadManager — directive evaluation & role assignment
├── squad.types.ts         # SquadOrderContext, SquadMemberTelemetry, SQUAD_DIRECTIVE
└── squad.config.ts        # SQUAD_CONFIG thresholds

lib/tanks/meso/            # Meso-layer (fireteam) tactical adaptation
├── meso.evaluator.ts      # MesoEvaluator.evaluateTacticalAdaptation
├── meso.types.ts          # FireteamContext, FIRETEAM_TACTIC
└── meso.config.ts         # MESO_CONFIG thresholds

lib/strategic/
└── missions.strategic.ts  # deriveDirective — objective → directive/target/forcedIntent

feature/
├── squad/squad-vehicles.tsx   # Per-team host: orchestrator + SquadProvider + AIVehicles
├── context/squad-context.tsx  # SquadProvider / useSquadContext
└── vehciles/ai-vehicle.tsx    # Consumes squad context each frame
```

## UnitRegistry (`squad.registry.ts`)

The single source of truth for live units across both teams.

- `useRegisterUnit` (in `battle-context.tsx`) registers each vehicle on mount; `AIVehicle` registers with `ai: true`, the player registers with `ai: false`.
- `UnitDef` carries `team`, `kind`, `radius`, `ai`, an optional `loadout` (`platform` + `weapon`), and a live `body` (`position`/`heading`/`speed`) that the owner mutates in place — readers get live references, not snapshots.
- `aiByTeam(team)` returns only AI units — the orchestrator's working set; the player is targetable but never receives orders.
- Caches (`byTeam`, `aiByTeam`, `getSnapshot`) rebuild only on register/unregister, so per-frame reads allocate nothing.

## Target Allocation (`squad.targets.ts`)

`createTargetAllocator()` returns a stateful function shared by `SquadOrchestrator` and `use-squad-targets`.

Behavior:

- **Sticky**: a member keeps its target until it dies, then picks a new one via `selectBestTarget` (`combat.targets.ts`), which applies an overcrowding penalty so squads spread fire.
- De-duplicates claims within a tick so two members don't pick the same target when both are free.
- Returns `Record<memberId, targetId | undefined>`.

The orchestrator turns allocations into `targetPositions` (`Map<unitId, Vector3>`) published through squad context — this is the per-unit "who do I shoot" answer, separate from the squad-level orders.

## SquadOrchestrator (`squad.orchestrator.ts`)

One instance per `SquadVehicles` (i.e., per team). Constructed with the registry, team, and the shared target allocator.

### `update(enemyTargets, healthMap, loadouts, targetPositions, squadOrders, state)`

- `enemyTargets`: living opposing units (`{id, position}`) from `useUnits()`
- `loadouts`: `Record<unitId, VehicleLoadout>` built from spawn data in `SquadVehicles` (`resolveVehicleLoadout` fills defaults)
- `state`: `SquadTickState` — `{ directive, isExplicitOrder, rallyPoint, objectiveTarget?, forcedIntent? }` supplied by the caller (player order for allies, mission objective or initial order for enemies)

Pipeline detail:

1. **Target allocation** — as above; also tracks `primaryTargetPos` and `closestEnemyDist` for the layers below.
2. **Telemetry** — `SquadMemberTelemetry[]`: normalized health, `VehiclePlatform` (from `VEHICLE_PLATFORMS[loadout.platform]`), `WeaponConfig` (from `WEAPONS[loadout.weapon]`), `isRetreating` (from `reportUnitRetreating`), and tactical-plane `Point2D` position (`worldX → x`, `worldZ → y`).
3. **Meso evaluation** — `MesoEvaluator.evaluateTacticalAdaptation` inspects _local_ superiority: enemies within `MESO_CONFIG.localAwarenessRadius` (180m) of the closest contact, ally/enemy ratio, and average health. During a retreat directive it can flip to `ADVANCE` + `COUNTER_AMBUSH` when the fireteam actually has the numbers. Returns `{ adaptedDirective, fireteamTactic }`.
4. **Macro evaluation** — `SquadManager.evaluateSquad` receives the _adapted_ directive plus telemetry, target position, and rally point; returns `Map<unitId, SquadOrderContext>`.
5. **Publish** — `targetPositions` and `squadOrders` maps are mutated in place; `AIVehicle`s read them through `useSquadContext()`.

`reportUnitRetreating(unitId, isRetreating)` feeds the retreating-units set used for telemetry and rout math.

## SquadManager (`squad.core.ts`)

Evaluates the macro layer and produces per-unit orders.

### Directive resolution

`currentDirective` (possibly meso-adapted) is overridden to `GENERAL_RETREAT` when either:

- `retreatingRatio >= SQUAD_CONFIG.generalRetreatThreshold` (0.4), or
- `avgHealth <= SQUAD_CONFIG.criticalSquadHealthThreshold` (0.3)

### Role & formation assignment (`buildCapabilityAssignments`)

Members are partitioned by `weapon.id`:

- `type63` → always `artillery_support`, deep-rear echelon offset
- `zu23` / `dshk` → direct combatants, sorted by `vehicle.mobility`

Per directive:

| Directive         | Assignment                                                       |
| ----------------- | ---------------------------------------------------------------- |
| `flank`           | high-mobility DShKs → `flank` (column, orbit); rest → `suppress` |
| `advance`         | direct combatants → `vanguard`/`suppress` in `wedge`             |
| `fightingRetreat` | direct combatants → `support` in `line`                          |
| `generalRetreat`  | direct combatants → `support` in `column`                        |
| `hold` (default)  | `suppress`/`vanguard` mix in `line`                              |

Each member gets a `SubGroupAssignment`: role, `formationType`, `formationOffset` (from `tactics.formation`), `subGroupLeaderId`, `useOrbitTactic`.

### `SquadOrderContext` (per unit)

```ts
{
  directive, fireteamTactic, assignedRole, formationType, formationOffset,
  subGroupLeaderId, useOrbitTactic,
  targetPosition,   // squad-level focus point (Point2D | null)
  rallyPoint,       // where the squad regroups (Point2D)
  isExplicitOrder, forcedIntent?, retreatingRatio,
}
```

`targetPosition` prefers `state.objectiveTarget` (mission `{x,z}` converted to `{x,y:z}`) over the allocated target position. `forcedIntent` is consumed by the utility selector; `ROUT_TREE` still evaluates first.

Note `Point2D` is the tactical plane (`x` = world X, `y` = world Z) — deliberately _not_ `THREE.Vector2`; squad logic stays renderer-agnostic.

## Meso Layer (`lib/tanks/meso/`)

Sits between the player's/commander's macro directive and the squad role assignment. One `FireteamContext` is evaluated per squad per tick (currently a single `"<team>-main-fireteam"`).

`MesoEvaluator.evaluateTacticalAdaptation` maps directive → `FIRETEAM_TACTIC`:

- `flank` → `FLANK_HOOK`, `advance` → `SUPPRESS_ANVIL`
- retreats → `BOUNDING_RETREAT`, `hold` → `HOLD_FORMATION`
- **Counter-ambush override**: during `fightingRetreat`/`generalRetreat`, if pursuers are within 180m, `localAllies/localEnemies >= 1.2`, and `avgHealth >= 0.35`, it returns `ADVANCE` + `COUNTER_AMBUSH`.

> `fireteamTactic` is propagated into every `SquadOrderContext` by `SquadOrchestrator`; the retreat intent vetoes itself under `COUNTER_AMBUSH`.

## React Integration

### `SquadVehicles` (`feature/squad/squad-vehicles.tsx`)

One per team (`AllyVehicles`, `OpponentVehicles`). Owns:

- `targetPositionsRef`, `squadOrdersRef` — mutable maps shared by reference
- `createTargetAllocator()` + `SquadOrchestrator` instances
- `useFrame(..., -3)` calling `orchestrator.update(...)` with a `SquadTickState` derived from the active mission objective: squad center + registry strength ratio → `deriveDirective`, falling back to `shared.directive` when no objective applies; rally point is the leader position or first spawn
- `loadouts` map built from each unit's resolved spawn `weapon`/`platform`
- `SquadProvider` wrapping all `AIVehicle`s

### `SquadProvider` / `useSquadContext` (`feature/context/squad-context.tsx`)

Supplies squad-wide values to every vehicle in the squad:

```ts
{
  (team,
    obstacles,
    targetPositionsRef,
    squadOrdersRef,
    retreatOnDamage,
    attackMode);
}
```

### `AIVehicle` consumption

Each frame the vehicle reads:

- `targetPositionsRef.current.get(unitId)` — its allocated target (falls back to the `targetPosition` prop)
- `squadOrdersRef.current.get(unitId)` — its `SquadOrderContext`, falling back to `NO_SQUAD_ORDER` (hold/support/line) before the first orchestrator tick
- `attackMode` — convenience flag (`directive === ADVANCE`)

The order lands in `TankContext.squadOrder`, where utility options (`attack`, `flank`, `retreat`, `follow-squad`) use `directive`, `assignedRole`, `formationOffset`, `rallyPoint`, etc. for scoring.

## Player Orders (Ally Squad)

`CombatContext` exposes `allyDirective` + `onAllyDirectiveChange`. The HUD buttons and Z/X/C hotkeys map to real `SQUAD_DIRECTIVE`s:

| Input      | Directive        | Effect                                       |
| ---------- | ---------------- | -------------------------------------------- |
| ATTACK / Z | `advance`        | pushes the macro layer forward               |
| FOLLOW / X | `hold`           | default stance                               |
| FLEE / C   | `generalRetreat` | explicit retreat order (meso can counter it) |

Mission objectives take over when no explicit ally order is active. Objectives are filtered by team and, for spatial objectives, by owning `squadId`; squads without a matching objective keep their initial order. Defend/escort objectives force `FOLLOW_LEADER` intent.

A Canvas bridge (`feature/missions/mission-position-bridge.tsx`) pushes live unit positions into `MissionRunner` at frame priority `-4`, before the squad orchestrator at `-3`.

## Configuration (`squad.config.ts`)

```ts
SQUAD_CONFIG = {
  generalRetreatThreshold: 0.4, // retreating ratio → squad-wide fallback
  criticalSquadHealthThreshold: 0.3, // avg health → defensive escalation
  defaultLeashDistance: 250, // strayed-from-rally distance
};
```

Meso thresholds live separately in `lib/tanks/meso/meso.config.ts` (`localAwarenessRadius`, `counterAmbushSuperiorityRatio`, `minHealthForCounterAttack`).

## Integration Map

| System                           | Relationship                                                                                                                                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/combat/`                    | `selectBestTarget`, `PotentialTarget`, `HealthMap`, damage → `onHit`/`onKill` feed health telemetry                                                 |
| `lib/vehicles/` + `lib/weapons/` | Platform/weapon profiles drive role assignment; `TankContext.squadOrder` consumed by utility options; `MesoEvaluator` lives under `lib/tanks/meso/` |
| `lib/tactics/`                   | `getFormationOffset` produces per-slot `formationOffset` from `FormationType`                                                                       |
| `lib/selector/`                  | Utility scoring reads `squadOrder` — squad doctrine becomes micro-behavior weights                                                                  |
| `feature/scene/`                 | `BattleProvider` owns the `UnitRegistry`; `useUnits`/`useRegisterUnit` feed it                                                                      |
| `feature/context/`               | `SquadProvider` (per-squad) + `CombatProvider` (player directive)                                                                                   |

## Debugging

- `registry.debugSnapshot()` — dump all registered units (id, team, kind, position, heading)
- `UnitDebugRings` component — visualizes unit radii in dev builds
- `TANK_CONFIG.utility.debug` — per-tank utility score tables (`docs/selector.md`)
- Orchestrator writes are in-place map mutations, so inspect `squadOrdersRef.current` in React DevTools or a `useFrame` log
