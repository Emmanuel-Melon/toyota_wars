# Providers

Toyota Wars uses React context at three levels: the **DOM shell** (game state shared with HUD/menus), the **Canvas scene** (R3F is a separate React root — context does not cross it), and **per-entity** providers (one vehicle / one squad at a time).

## Provider tree

```
<GameProviders>                        game/game-providers.tsx
├── ArenaProvider                      context/arena-context.tsx
├── CombatProvider                     context/combat-context.tsx
├── MissionSessionProvider             feature/missions/mission-session.tsx
├── CameraModeProvider                 context/camera-mode-context.tsx
└── GameRuntime                        (computes `paused`)
    ├── TargetsProvider                context/targets-context.tsx
    └── PlayerProvider                 context/player-context.tsx
        └── <Render /> → <Canvas>       render.tsx
            └── SceneProviders         feature/scene/scene-providers.tsx
                ├── MissionContext.Provider
                └── FrameLoopProvider  render-loop.tsx
                    ├── GameLoopDriver
                    ├── MissionClock
                    └── <Physics> (rapier)
                        ├── PlainsEnvironment
                        └── QuarksProvider   feature/effects/quarks-provider.tsx
                            └── FxProvider   context/fx-context.tsx
                                └── BattleProvider   feature/scene/battle-context.tsx
                                    └── …scene objects…
                                        ├── VehicleProvider   (per vehicle, in scene.tsx / vehicle-visuals)
                                        └── SquadProvider     (per squad, in squad-vehicles.tsx)
```

## DOM shell providers

Mounted once in `game/game-providers.tsx`. These are visible to both the HUD (outside `<Canvas>`) and scene components that consume them through props/refs.

| Provider                 | File                                   | Holds                                                                                                                                                                                                                              | Key consumers                                                                               |
| ------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ArenaProvider`          | `context/arena-context.tsx`            | `ArenaRuntime`: terrain sampler, obstacles, roads, bound, player spawn/heading; `ArenaControls`                                                                                                                                    | `usePlayerCamera`, `CasingSystem`, `MissionMinimap`, `RoadNetworkManager`, scene terrain    |
| `CombatProvider`         | `context/combat-context.tsx`           | `health`, `partHealth`, squad/unit roster, `winner`, `stats`, `fireDesignation`, `onHit`/`onKill`/`getHealth`/`recordPlayerDamage`                                                                                                 | `PlayerHealthBar`, `CombatStats`, `SquadVehicles`, `ProjectileSystemLayer`, `useGameScreen` |
| `MissionSessionProvider` | `feature/missions/mission-session.tsx` | Mission session: canonical `MissionRunner` host, `startMission`, `retryMission`, `returnToSkirmish`                                                                                                                                | `MissionLaunchBridge`, `MissionResultScreen`, `render.tsx`                                  |
| `CameraModeProvider`     | `context/camera-mode-context.tsx`      | `mode` (`"chase" \| "drone"`), `setMode`, `toggleMode`                                                                                                                                                                             | `usePlayerCamera`, `CameraModeControl` (V key)                                              |
| `TargetsProvider`        | `context/targets-context.tsx`          | `enemies`, `allyTargets`, `projectileTargets` (live target lists for AI/HUD)                                                                                                                                                       | `LeadReticle`, `ProjectileSystemLayer`, squad AI                                            |
| `PlayerProvider`         | `context/player-context.tsx`           | `playerBody` (KinematicTankBody), `playerWeapon`, `playerVehicle`, loadout, `aimMode`, `playerAimController`, ammo, shared refs (`aimTargetRef`, `muzzleRef`, `celebrationRef`, `recoilRef`, damage effects), `paused`/`destroyed` | `PlayerWeapon`, `PlayerCamera`, `DamageWarningBridge`, `Speedometer`, reticles, minimap     |

`GameRuntime` derives `paused` (non-playing mode, mission finished, or winner outside mission) and passes it to `PlayerProvider`, which freezes player input/weapon logic.

## Canvas providers

Mounted inside `<Canvas>` by `SceneProviders`. Required because **r3f renders into a separate React root** — providers outside `<Canvas>` are invisible to scene components.

| Provider                  | File                                   | Holds                                                                                   | Key consumers                                                                                                         |
| ------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MissionContext.Provider` | `context/missions.context.tsx`         | `MissionRunner` instance (raw, via `useMissionRunner`)                                  | `MissionClock`, `useMissionSession` internals                                                                         |
| `MissionClock`            | `context/missions.context.tsx`         | Not a provider — drives `runner.update(dt)` each frame (clamped to 0.1s)                | mounted once in `SceneProviders`                                                                                      |
| `Physics`                 | `@react-three/rapier`                  | Rapier physics world                                                                    | vehicle collision, `WreckPickupSystem`                                                                                |
| `PlainsEnvironment`       | `feature/scene/plains-environment.tsx` | Terrain/sky/lighting scene graph                                                        | visual only                                                                                                           |
| `QuarksProvider`          | `feature/effects/quarks-provider.tsx`  | One shared `BatchedRenderer` for all `three.quarks` particle systems, updated per frame | `VehicleExplosion`, future particle FX                                                                                |
| `FxProvider`              | `context/fx-context.tsx`               | `FxBus` — typed event bus (`shot`, `explosion`, `whizz`, `casingLand`, `clear`)         | `ProjectileSystem`, `CasingSystem`, `ProjectileRenderer`, `FxAudio`, `DamageWarningBridge` (via `useFxEvent`/`useFx`) |
| `BattleProvider`          | `feature/scene/battle-context.tsx`     | `UnitRegistry` (live unit positions/bodies), `WreckRegistry`, `projectiles` ref handle  | `PositionTracker`, `ProjectileSystemLayer`, `SquadVehicles`, `BattleResetEffects`, devtools `window.__battle`         |

## Per-entity providers

| Provider          | File                          | Scope                   | Holds                                                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VehicleProvider` | `context/vehicle-context.tsx` | One vehicle visual tree | `unitId`, `team`, `palette`, `weapon`, health/partHealth, `wrecked`, and shared refs (`vehicleRef`, `muzzleRef`, `aimTargetRef`, `celebrationRef`, `recoilRef`, `motionRef`). Consumers: `Vehicle` → `PickupHull`, `BedWeapon`, `Wheels`, `CrewGunner`, `TankPart`, `useTurretAim` |
| `SquadProvider`   | `context/squad-context.tsx`   | One squad's AI units    | `team`, `obstacles`, `targetPositionsRef`, `squadOrdersRef`, `retreatOnDamage`, `attackMode`. Consumers: `AIVehicle` behavior trees                                                                                                                                                |

## Conventions

- **Hooks throw outside their provider** (`useArena`, `useCombat`, `usePlayer`, `useFx`, `useVehicleContext`, `useSquadContext`, `useBattle`) — a missing provider fails loudly at mount.
- **Mission state has two faces**: `useMissionRunner()` for the imperative runner, `useMission()` (`useSyncExternalStore`) for reactive HUD snapshots.
- **Reset flow**: `CombatProvider.resetEpoch` bumps → `BattleResetEffects` (inside `BattleProvider`) clears wrecks, projectiles, mission unit positions, and damage warnings.
- **Non-React stores** bridge the Canvas/DOM boundary where context can't: `lib/combat/damage-warnings.ts` (module-level store + `useSyncExternalStore`) and `lib/fx/fx.bus.ts` (event bus).
- **Canvas frame work** registers with `useGameFrame(..., phase)` from `render-loop.tsx`; remaining per-entity `useFrame` hooks are local visual effects.
