# Utility Options System

This document describes `lib/utility/` — the tank-specific layer that defines _which_ intents a vehicle can choose and _how_ each one is scored. It sits on top of the generic scoring engine in `lib/selector/` (`docs/selector.md`) and feeds the behavior subtrees in `lib/tanks/trees/`.

## Where It Fits

```
TankContext (senses + squad order + vehicle + weapon)
        │
        ▼
lib/selector/            generic engine: curves, scoring, commitment, BTNode wrapper
        │  scores each UtilityOption → picks a TankIntent
        ▼
lib/utility/             tank intents & their scoring rules (this doc)
        │  TANK_INTENT id → option (scoring) + tree (behavior)
        ▼
lib/tanks/trees/         TreeDef per intent, built by tanks.builder
        │
        ▼
TankDecision → movement resolver / weapon executor
```

`lib/selector/` answers "given scored options, which wins?" `lib/utility/` answers "what are the tank's options and what makes each appealing?" Keeping them separate means the selector engine stays domain-agnostic and reusable for other unit types later.

## File Layout

```
lib/utility/
├── utility.types.ts     # TANK_INTENT, TankIntent, TankUtilityOption
├── utility.config.ts    # WEAPON_RANGE (combat.fireRange)
├── utility.core.ts      # ratio, actsIndependently, createUtilityDebug
├── utility.options.ts   # tankOptions — aggregates all options in priority order
└── options/
    ├── attack.ts            # ATTACK
    ├── retreat.ts           # RETREAT
    ├── flank.ts             # FLANK
    ├── follow-leader.ts     # FOLLOW_LEADER (leader-distance based)
    ├── follow-squad.ts      # FOLLOW_LEADER (squad-directive based)
    └── patrol.ts            # PATROL (baseline)
```

## Types (`utility.types.ts`)

```ts
TANK_INTENT = {
  ATTACK: "attack",
  RETREAT: "retreat",
  FLANK: "flank",
  FOLLOW_LEADER: "followLeader",
  PATROL: "patrol",
};

TankUtilityOption = UtilityOption<TankContext, TankIntent>;
```

`TankUtilityOption` is the selector's `UtilityOption` bound to `TankContext` — each option declares an `id`, a `considerations` array (name + `input(ctx)` + curve from `lib/selector/math`), and an optional `weight(ctx)` multiplier.

## Options (`options/`)

Each file exports one scored option. Common inputs come from `TankContext` senses (`health`, `targetDistance`, `vehicle`, `weapon`, `leaderDistance`, `retreatingNeighborsCount`, …) and from `ctx.squadOrder` (macro-layer orders, see `docs/squad.md`).

| Option               | Intent         | Key signals                                                                                                                                                            |
| -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attackOption`       | `attack`       | `weapon.directSuppression` weight; squad role bonus for `suppress`/`vanguard`; type63 preferred-range engagement curve; `health * vehicle.frontlineDurability` gate    |
| `retreatOption`      | `retreat`      | weight scales with `1 - vehicle.frontlineDurability` (fragile platforms panic sooner) ×1.6 on `generalRetreat`; `healthPanicCurve` logistic + `neighborPanicContagion` |
| `flankOption`        | `flank`        | weight 1.5 only when `squadOrder.directive === "flank"` **and** `assignedRole === "flank"`, else 0.3; requires target, out-of-range, allied backing                    |
| `followLeaderOption` | `followLeader` | has-leader gate + strayed-from-leader curve with a 0.2 floor inside the leash                                                                                          |
| `followSquadOption`  | `followLeader` | same intent id; weight 1.2 on `hold`/`advance`, 0.8 otherwise; rally-point presence + strayed curve                                                                    |
| `patrolOption`       | `patrol`       | constant 0.1 baseline — always slightly viable, wins when nothing else scores                                                                                          |

> `followLeaderOption` and `followSquadOption` intentionally share `TANK_INTENT.FOLLOW_LEADER`. Both are scored; whichever produces the higher raw score effectively represents that intent (the selector picks by score, and both map to the same `FOLLOW_LEADER_TREE` child). This is an OR-composition of two scoring models for one behavior.

## Shared Helpers (`utility.core.ts`)

- `ratio(a, b)` — `a / max(1, a + b)`, safe proportion for consideration inputs.
- `actsIndependently(ctx)` — true when there's no leader or `weapon.directSuppression >= 0.5` (direct-fire platforms act on their own; artillery supports).
- `createUtilityDebug(label)` — returns a throttled `console.table` logger when `TANK_CONFIG.utility.debug` is on, `undefined` otherwise. Fed into `UtilitySelector`'s `debug` config.

## Aggregation (`utility.options.ts`)

```ts
export const tankOptions: TankUtilityOption[] = [
  attackOption,
  retreatOption,
  flankOption,
  followLeaderOption,
  followSquadOption,
  patrolOption,
];
```

Order matters only for readability — the selector scores every option independently. `tanks.trees.ts` passes this array to `new UtilitySelector(...)`.

## Interaction With `lib/selector/`

| Selector provides                                           | Utility uses it for                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `curves.*`, `remap`, `clamp01` (`math.ts`)                  | shaping every consideration input                                                 |
| `UtilityOption`, `ScoredRow` (`types.ts`)                   | `TankUtilityOption` type alias; debug row typing                                  |
| `scoreOptions`/`chooseOption` (`scoring.ts`, `selector.ts`) | invoked internally by `UtilitySelector` — utility code never calls these directly |
| `UtilitySelector` BTNode (`node.ts`)                        | constructed in `buildUtilityTankTree` with `tankOptions` + per-intent `children`  |

The dependency is one-directional: `lib/utility/` imports from `lib/selector/`, never the reverse. The selector engine knows nothing about tanks — it only sees `TankContext` as an opaque generic `C`.

## Interaction With the Rest of the System

- **`lib/tanks/tanks.types.ts`** — `TankContext` is the scoring blackboard; `ctx.vehicle`, `ctx.weapon`, and `squadOrder` are the main utility inputs.
- **`lib/tanks/tanks.trees.ts`** — `buildUtilityTankTree` wires `tankOptions` + `UTILITY_TREES` children + momentum/commit config into a per-tank `UtilitySelector`, wrapped in a rout-check `BTSelector`.
- **`lib/tanks/trees/`** — each intent's behavior subtree; the selector delegates execution here after choosing.
- **`lib/squad/`** — `SquadOrchestrator`/`SquadManager` produce `SquadOrderContext` per unit; options read `directive`, `assignedRole`, `rallyPoint`, `retreatingRatio`.
- **`lib/weapons/`** — `WEAPONS` profiles feed `ctx.weapon` signals (suppression, durability, preferred range, cooldown).
- **`lib/vehicles/`** — `VEHICLE_PLATFORMS` feed `ctx.vehicle` signals (mobility, frontline durability).
- **`feature/vehciles/ai-vehicle.tsx`** — assembles `TankContext` each frame (including `squadOrder` from squad context) and calls `tree.evaluate(ctx)`.

## Adding a New Intent

1. Add the id to `TANK_INTENT` in `utility.types.ts`.
2. Create `options/<name>.ts` exporting a `TankUtilityOption`.
3. Register it in `utility.options.ts`.
4. Create `trees/<name>.ts` with a `TreeDef` and map it in `UTILITY_TREES` (`docs/selector.md` has the full checklist).

The `Record<TankIntent, …>` `satisfies` checks in `tanks.trees.ts` fail compilation if the option or tree is missing.
