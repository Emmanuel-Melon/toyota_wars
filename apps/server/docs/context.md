# Context Architecture

This document describes the split React context setup for the game shell.

## Phase 1: Single PlainsProvider (Previous Architecture)

The original implementation used one outer `PlainsProvider` for shared battle, player, and HUD state. Phase 2 replaced the combined `usePlains()` value with focused providers, while keeping `PlainsProvider` as a composition wrapper.

## Phase 2: Split Contexts (Implemented)

Phase 2 splits context by concern so health/stat updates no longer rerender player controls or unrelated UI unnecessarily.

### Provider Tree

```
PlainsExperience (owns mode/round/playerLoadout)
└─ PlainsProvider (mode, loadout)
   ├─ CombatProvider
   │  ├─ health / partHealth / stats / allyPersonality
   │  ├─ onHit / onKill / setCurrentAmmo / onAllyPersonalityChange
   │  ├─ derived living counts and winner
   │  └─ PlainsRuntime (computes paused from mode + winner)
   │     ├─ TargetsProvider
   │     │  ├─ enemies / allyTargets / playerTarget / projectileTargets
   │     │  └─ PlayerProvider (paused)
   │     │     ├─ playerBody / playerCommand / playerMotion
   │     │     ├─ playerPartHealth / aimRef
   │     │     ├─ PlainsScene + Canvas children
   │     │     ├─ CombatStats
   │     │     ├─ ControlHints
   │     │     └─ SceneReticle
   │     └─ GameMenu / GameOverMenu
```

### Provider Locations

- `feature/scene/index.tsx` owns the shell `mode`/`round`/`playerLoadout` state. Play and Replay open `VehicleSelectMenu`; confirming increments `round` and remounts `PlainsProvider` with the chosen loadout.
- `feature/context/plains-context.tsx` is now a composition wrapper: `CombatProvider` > `TargetsProvider` > `PlayerProvider`. It derives `paused` from the current mode and combat `winner`.
- `feature/context/combat-context.tsx` owns combat state and actions: `health`, `partHealth`, `stats`, `maxAmmo`, `allyPersonality`, `onHit`, `onKill`, `setCurrentAmmo`, `onAllyPersonalityChange`, and derived winner/living counts.
- `feature/context/player-context.tsx` owns the active `playerLoadout`, derived `playerWeapon`/`playerVehicle`, movement tuning from platform mobility, and player runtime refs: `playerBody`, `playerCommand`, `playerMotion`, `playerPartHealth`, `aimRef`, and `paused`.
- `feature/context/targets-context.tsx` owns target collections: `enemies`, `allyTargets`, `playerTarget`, and `projectileTargets`.
- `feature/scene/battle-context.tsx` remains separate and inside `<Canvas>`. It owns the unit registry and projectile pool handle, which the HTML HUD does not need.

React Three Fiber bridges outer React context into the Canvas renderer, so `useCombat()`, `usePlayer()`, and `useTargets()` work in Canvas children and in the HTML overlay.

### Context Consumers

- `CombatStats` reads `CombatContext` for ammo/stats and `PlayerContext` for the selected weapon and platform.
- `ProjectileSystemLayer` reads health/hit/kill handlers from `CombatContext`, pause state from `PlayerContext`, and targets from `TargetsContext`.
- `PositionTracker` reads target collections from `TargetsContext`.
- `OpponentVehicles` and `AllyVehicles` read health, part health, player leader state, and ally personality.
- `PlayerUnit`, `PlayerPresenter`, `PlayerCamera`, `KeyboardNavigator`, `PlayerController`, `PlayerWeapon`, and `SceneReticle` read player runtime state from `PlayerContext`. `PlayerWeapon` also reports ammo to `CombatContext`.

### Components Kept Prop-Driven

These components remain independent of context so they can be reused and tested without a provider:

- `Vehicle`, `TankHull`, `Turret`, `TankPart`, `HealthBar`
- `AIVehicle`
- `SquadVehicles`
- `ProjectileSystem`
- `GameMenu`, `VehicleSelectMenu`, `GameOverMenu`, `ControlHints`

`SquadVehicles` still receives health and part health explicitly from `AllyVehicles`/`OpponentVehicles`, which are the context-aware wrappers.

### Reset Lifecycle

`PlainsProvider` is keyed by the round counter in `feature/scene/index.tsx`. Replay increments the round and sets mode to `playing`, remounting all three providers so `health`, `partHealth`, `stats`, ally personality, player runtime refs, aim ref, and target collections reset. The shell no longer explicitly resets combat state; provider state initializes on mount.
