# Utility Selector System

This document describes the utility-based AI selection system used in Toyota Wars — how vehicles score and pick between competing intents (attack, retreat, flank, follow, patrol) each tick.

## Overview

Utility AI replaces hand-written priority trees with scored options. Every candidate "intent" declares a set of **considerations** (things the tank can sense) and an optional **weight** (per-unit multiplier). Each tick the selector scores all options, applies commitment rules to prevent flip-flopping, and delegates execution to the behavior tree branch mapped to the winning intent.

### Why Utility Selection?

- **Emergent behavior**: combining many small signals produces nuanced decisions without explicit state machines
- **Tunable**: each consideration is an independent curve — adjust one input without rewriting logic
- **Shared vocabulary**: the same scoring math can drive squad-level and vehicle-level decisions

## File Layout

```
lib/selector/                  # The utility selector implementation
├── math.ts                    # clamp01, remap, response curves
├── types.ts                   # Curve, Consideration, UtilityOption, ScoredRow, etc.
├── scoring.ts                 # scoreConsiderations / scoreOptions
├── selector.ts                # chooseOption (scoring + commitment)
└── node.ts                    # UtilitySelector — BTNode wrapper

lib/utility/             # Tank-specific option definitions
├── utility.types.ts           # TANK_INTENT, TankIntent, TankUtilityOption
├── utility.config.ts          # WEAPON_RANGE
├── utility.core.ts            # ratio, actsIndependently, createUtilityDebug
├── utility.options.ts         # tankOptions — aggregates all option files
└── options/
    ├── attack.ts
    ├── flank.ts
    ├── follow-leader.ts
    ├── follow-squad.ts
    ├── patrol.ts
    └── retreat.ts
```

> `lib/selector/` is the single implementation. All tank utility code (`tanks.trees.ts`, `utility.types.ts`, `utility.core.ts`, and the option files) imports from it.

## Core Concepts

### Curves (`math.ts`)

Every consideration maps a normalized input (`0..1`) to a score (`0..1`) through a **curve**:

| Curve            | Shape                    | Typical use                           |
| ---------------- | ------------------------ | ------------------------------------- |
| `linear`         | straight line            | distance falloff, proportions         |
| `invert`         | `1 - x`                  | "lower is better" (e.g., low health)  |
| `power(p)`       | slow start, steep finish | "only matters when high"              |
| `invPower(p)`    | steep start, flat finish | "matters as soon as non-zero"         |
| `logistic(m, s)` | smooth S-curve threshold | health panic, outnumbered checks      |
| `step(t)`        | hard threshold           | binary gates (has target, has leader) |
| `constant(v)`    | flat value               | baselines (patrol = 0.1)              |

`remap(v, min, max)` normalizes raw world values (distances, counts) into `0..1` before they hit a curve.

### Considerations & Options (`types.ts`)

```ts
interface Consideration<C> {
  name: string;
  input: (ctx: C) => number; // normalized 0..1
  curve: Curve;
}

interface UtilityOption<C, Id extends string> {
  id: Id;
  considerations: Consideration<C>[];
  weight?: (ctx: C) => number; // per-unit multiplier, 1 = neutral
}
```

`C` is the blackboard context — for tanks that's `TankContext` (see `docs/tanks.md`), which carries senses like `targetDistance`, `health`, `vehicle`, `weapon`, `squadOrder`, `leaderDistance`, etc.

### Scoring (`scoring.ts`)

`scoreConsiderations` **multiplies** all consideration outputs — any single `0` vetoes the whole option. To stop options with many considerations from being unfairly punished, a compensation factor is applied:

```
score = product(inputs) + (1 - product) * (1 - 1/n) * product
```

`scoreOptions` then multiplies by the option's `weight` and clamps to `0..1`.

### Choosing with Commitment (`selector.ts`)

`chooseOption` adds two anti-oscillation mechanisms on top of raw scores:

- **Momentum bonus** (`momentumBonus`, default `0.15`): the currently active option gets a score boost, so it takes a clearly better alternative to switch.
- **Minimum commit time** (`minCommitMs`, default `600ms`): the current option is kept as long as it scores above `0`, even if another option briefly scores higher.

The result is stored in `UtilityMemory { currentId, since }`.

### The BTNode Wrapper (`node.ts`)

`UtilitySelector` adapts the pure scoring functions into the behavior-tree runtime:

1. `evaluate(ctx)` first checks the optional `forcedIntent(ctx)` hook. If it returns an id present in `children`, that child is evaluated directly, bypassing scoring and fallback.
2. Otherwise it calls `chooseOption` to pick an intent id.
3. It delegates to `children[id]` — a `BTNode` built from the matching `TreeDef` in `lib/tanks/trees/`.
4. If the chosen child returns `FAILURE` and `fallbackOnFailure` is enabled (default), it retries the remaining options in descending score order — useful when preconditions change mid-tick.

Scripted mission objectives use `forcedIntent` for defend/escort (`FOLLOW_LEADER`). `ROUT_TREE` remains the outer selector, so a routed squad still flees before any forced intent runs.

## Integration

### Per-tank wiring

`buildUtilityTankTree(unitId)` in `lib/tanks/tanks.trees.ts` is called once per vehicle (in `useAITankRuntime`). Each tank gets its own `UtilitySelector` instance — selector memory and stateful subtrees (patrol goals, flank orbits) must not be shared.

Every frame, `AIVehicle` calls `runtime.tree.evaluate(ctx)` with a fresh `TankContext` assembled from:

- physics body state (`position`, `heading`, `speed`)
- senses (`threats`, `obstacles`, `leader`, `leaderDistance`, …)
- squad macro-layer output (`squadOrder` from `SquadOrchestrator` via `squadOrdersRef`)
- resolved loadout (`VEHICLE_PLATFORMS[loadout.platform]`, `WEAPONS[loadout.weapon]`)

The tree root is a `BTSelector` containing `ROUT_TREE` (squad-rout flee) first, then the `UtilitySelector`. So routing overrides utility scoring entirely.

### Where options live

Each intent has two halves that must stay in sync:

| Intent (`TANK_INTENT`) | Scoring                                               | Behavior subtree         |
| ---------------------- | ----------------------------------------------------- | ------------------------ |
| `attack`               | `options/attack.ts`                                   | `trees/attack.ts`        |
| `retreat`              | `options/retreat.ts`                                  | `trees/flee.ts`          |
| `flank`                | `options/flank.ts`                                    | `trees/flank.ts`         |
| `followLeader`         | `options/follow-leader.ts`, `options/follow-squad.ts` | `trees/follow-leader.ts` |
| `patrol`               | `options/patrol.ts`                                   | `trees/patrol.ts`        |

`utility.options.ts` aggregates them into `tankOptions`, which `buildUtilityTankTree` hands to `UtilitySelector`. `UTILITY_TREES` maps each `TankIntent` to its `TreeDef` for `buildTankTree`.

### Squad-layer interaction

The utility layer is the **micro** layer (what one tank does). Above it:

- `SquadOrchestrator` → `SquadManager.evaluateSquad` assigns `SquadOrderContext` per unit (directive, role, formation, rally point).
- `MesoEvaluator` can locally adapt the macro directive (e.g., counter-ambush during retreat).
- Options read `ctx.squadOrder` to weight intents — e.g., `flank.ts` only scores highly when the squad directive is `flank` **and** the unit's `assignedRole` is `flank`; `retreat.ts` only scores under a retreat directive/tactic and is vetoed during `COUNTER_AMBUSH`.
- `SquadOrderContext.forcedIntent` is wired into `UtilitySelectorConfig.forcedIntent` (`tanks.trees.ts`) so mission scripts can bypass scoring for a specific intent.

## Adding a New Intent

1. Add the id to `TANK_INTENT` in `utility.types.ts`.
2. Create `options/<name>.ts` exporting a `TankUtilityOption` (id + considerations + optional weight).
3. Register it in `utility.options.ts`.
4. Create `trees/<name>.ts` exporting a `TreeDef` for the behavior.
5. Map it in `UTILITY_TREES` in `tanks.trees.ts`.

The `Record<TankIntent, …>` `satisfies` checks will flag any missing piece at compile time.

## Debugging

Set `TANK_CONFIG.utility.debug = true` — `createUtilityDebug(unitId)` then logs a throttled `console.table` of every option's raw score, final score, and the chosen intent, once per second per tank.
