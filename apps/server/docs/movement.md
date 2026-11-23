# Movement Plan

## Goal

Separate **decision-making** from **movement execution**:

- Behavior trees decide **what** to do: idle, move, chase, flee, follow, attack, retreat.
- A movement library decides **how** to move: steering, obstacle avoidance, acceleration, turning, bounds, and integration.
- Both the player and AI use the same canonical tank body and movement motor.
- External systems such as Yuka steering, Rapier physics, and future route planning can plug in later without changing the behavior trees.

This is an internal movement module. No external movement or physics package is added in the first implementation.

## Implemented

- `KinematicTankBody` is the canonical player and AI motor.
- Behavior nodes emit `TankDecision`; `DefaultOrderResolver` converts orders into drive commands.
- AI damage retreat is a high-priority behavior-tree branch.
- `KeyboardNavigator` writes a `DriveCommand`; `PlayerController` steps the player body.
- `DefaultWeaponExecutor` owns opportunity fire, range, alignment, cooldown, and shot heading.
- Rendering, camera, shooting, targeting, and the unit registry read body state.
- Frame priorities are explicit: `-2` input/decisions, `-1` body steps, `0` presentation/sync.

## Baseline before refactor

### Player ownership was mesh-driven

- `Vehicle` owns the player transform.
- `KeyboardNavigator` mutates `group.position` and `group.rotation.y` directly.
- `PositionTracker` copies the mesh transform into `playerPos` and `playerHeading`.
- `PlayerUnit` registers those refs as the player body.
- `PlayerUnit.speed` is hardcoded to `0`.
- `PlayerCamera` and `Shooting` read the mesh/group directly.

This made the render object the source of truth for player movement.

### AI ownership was driver-driven

- `KinematicDriver` owns AI `position`, `heading`, and `speed`.
- `AIVehicle` evaluates the behavior tree.
- The tree writes `TankIntent`.
- `AIVehicle` calls `driver.step(intent, delta)`.
- `groundVehicle` copies the driver state onto the mesh.
- `UnitRegistry` aliases the driver body.

This was closer to the target architecture, but the behavior tree still computed movement steering.

### Behavior trees previously influenced movement

The trees do not write positions directly, but they do control movement intent:

- `ChaseWithAvoidance` computes heading and obstacle avoidance.
- `Patrol` owns a goal, pause timer, and steering.
- `FollowLeader` computes formation position and steering.
- `Flee` computes escape headings.
- `AimAtTarget` and `ShootTarget` set heading and throttle.
- `AIVehicle` separately overrides movement for damage retreat and firing.

Movement ownership was therefore split between behavior nodes, `AIVehicle`, `KinematicDriver`, and `KeyboardNavigator`.

### Issues addressed by the refactor

- Player and AI use different movement rules for acceleration, turning, bounds, and integration.
- `AvoidanceSteering` and `ChaseWithAvoidance` duplicate obstacle-avoidance logic.
- `AIVehicle` mixes behavior execution, movement overrides, and weapon overrides.
- `PositionTracker` creates an extra transform-copy layer for the player.
- `PlayerUnit` reports `speed = 0` because the player has no canonical body.
- `feature/vehciles/fleet.tsx` contains an unused placeholder movement implementation.

## Target Architecture

```text
Player input ─┐
              ├─> TankDecision / DriveCommand ─> MovementBody ─> VehicleState
AI behavior ──┘                                      │
                                                     ├─> render mesh
                                                     ├─> unit registry
                                                     ├─> camera
                                                     └─> shooting
```

The behavior tree produces semantic orders. The movement library resolves those orders into drive commands and applies them to a canonical body. Rendering and combat systems consume the resulting state.

## Core Concepts

### Canonical vehicle state

A single body per unit owns:

```ts
interface VehicleState {
  position: THREE.Vector3;
  heading: number;
  speed: number;
}
```

This body is the source of truth for rendering, targeting, registry queries, camera, and shooting.

Neither the render mesh nor behavior nodes own movement state.

### Drive command

The movement body consumes a low-level drive command:

```ts
interface DriveCommand {
  /** -1..1 forward/reverse throttle. */
  throttle: number;
  /** Autopilot heading. null means use manual steering. */
  desiredHeading: number | null;
  /** -1..1 manual steering input. */
  steer: number;
}
```

AI orders usually produce `desiredHeading`. Player input usually produces `steer`.

### Movement body

```ts
interface MovementBody {
  readonly position: THREE.Vector3;
  readonly heading: number;
  readonly speed: number;
  step(command: DriveCommand, dt: number): void;
}
```

Initial implementation:

- `KinematicTankBody` extracted and generalized from `KinematicDriver`.
- Handles rate-limited turning, acceleration, speed factor, integration, and world bounds.
- Later, a Rapier-backed body can implement the same interface.

### High-level behavior orders

The behavior tree emits semantic orders instead of steering values:

```ts
type MovementOrder =
  | { type: "idle" }
  | {
      type: "moveTo";
      point: Readonly<THREE.Vector3>;
      speed?: number;
      stopDistance?: number;
    }
  | {
      type: "flee";
      threats: readonly TankThreat[];
      speed?: number;
    }
  | {
      type: "follow";
      leader: TankLeader;
      offset: readonly [number, number];
    }
  | {
      type: "face";
      point: Readonly<THREE.Vector3>;
    };

type WeaponOrder =
  | { type: "hold" }
  | {
      type: "fireAt";
      point: Readonly<THREE.Vector3>;
      requireAlignment?: boolean;
    };

interface TankDecision {
  movement: MovementOrder;
  weapon: WeaponOrder;
}
```

`TankDecision` replaces the movement and combat responsibilities previously held by `TankIntent`.

### Order resolver

The movement library converts an order into a drive command:

```ts
interface WorldMovement {
  bound: number;
  obstacles: readonly Obstacle[];
}

interface OrderResolver {
  resolve(
    order: MovementOrder,
    state: VehicleState,
    world: WorldMovement,
  ): DriveCommand;
}
```

Initial resolver responsibilities:

- `idle`: zero throttle, hold heading.
- `moveTo`: steer toward point, stop within `stopDistance`, avoid obstacles.
- `flee`: choose an escape heading away from all threats and boundaries.
- `follow`: compute the formation point, then steer toward it.
- `face`: turn toward a point without driving.

Future implementations can delegate to Yuka steering or a route planner.

### Player input

`KeyboardNavigator` no longer mutates the mesh. It produces a manual drive command:

```ts
interface ManualDriveInput {
  throttle: number;
  steer: number;
}
```

The player controller resolves that into the same `DriveCommand` consumed by `MovementBody`.

This preserves tank-style `W/S` and `A/D` controls while sharing acceleration, turning limits, bounds, and collision behavior with AI.

## Behavior Tree Implementation

### Context

`TankContext` uses a decision object:

```ts
interface TankContext extends TankSenses {
  decision: TankDecision;
}
```

Behavior nodes write only orders.

`TankSenses` carries the state needed to make decisions that previously lived in `AIVehicle`:

```ts
interface TankSenses {
  // Existing senses...
  retreatActive: boolean;
  canFireWhileMoving: boolean;
}
```

### Node responsibilities

| Node              | New responsibility                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `Patrol`          | Choose a waypoint and pause state; emit `moveTo`.                                                          |
| `Chase`           | Emit `moveTo` toward target with standoff; weapon order handled separately.                                |
| `Flee`            | Emit `flee` with threats.                                                                                  |
| `FollowLeader`    | Emit `follow` with leader and formation offset.                                                            |
| `AimAtTarget`     | Emit `face`; optionally `fireAt`.                                                                          |
| `ShootTarget`     | Emit `face` + `fireAt` with alignment requirement.                                                         |
| `Idle`            | Emit `idle` + `hold`.                                                                                      |
| Damage retreat    | Move from `AIVehicle` override into the tree as a high-priority retreat sequence.                          |
| `fireWhileMoving` | Replace the `AIVehicle` firing override with a `fireAt.requireAlignment` rule or weapon executor behavior. |

The `AIVehicle` frame loop now:

1. Update senses and timers.
2. Evaluate tree.
3. Resolve movement order.
4. Step the movement body.
5. Execute weapon order.
6. Sync the mesh.

No movement steering or direct position mutation inside behavior nodes.

### Damage retreat

Damage retreat is a behavior, so it is decided by the tree:

```text
selector
  sequence
    CheckRetreating
    Flee
  normal behavior
```

`AIVehicle` continues to own the damage timer and sets `retreatActive`, but the tree decides to flee and the movement library decides how.

### Fire while moving

Opportunity fire now lives in the weapon-order path:

- The tree emits `fireAt` when it wants a shot.
- `DefaultWeaponExecutor.resolveOrder()` converts `hold` into opportunity fire for units with `canFireWhileMoving` when the target is in range.
- `requireAlignment` controls whether the hull must be aligned first.
- `DefaultWeaponExecutor.execute()` handles range, alignment, cooldown, and projectile heading.
- `AIVehicle` no longer contains a separate firing override.

## Player Ownership Implementation

1. Create a `KinematicTankBody` at the player spawn in `PlainsScene`.
2. Register that body through `PlayerUnit`.
3. Replace `PlayerUnit.speed = 0` with the body speed.
4. Change `KeyboardNavigator` to emit manual drive input.
5. Add a `PlayerController` that steps the body each frame.
6. Sync the player mesh from the body state.
7. Move `PlayerCamera` and `Shooting` to read the player body instead of the mesh.
8. Remove the player-copy responsibility from `PositionTracker`.
9. Keep target-array syncing for enemies/allies, reading from the registry after movement updates.

The player mesh becomes a render output only:

```text
KeyboardNavigator -> DriveCommand -> KinematicTankBody -> Vehicle group transform
```

## Frame Pipeline

Use a stable update order and keep all `useFrame` priorities at `0` or negative. Positive priorities disable automatic rendering.

Implemented order:

- `-2`: capture player input and build AI decisions.
- `-1`: resolve orders and step all movement bodies.
- `0`: sync registry targets, camera, shooting, and render helpers.

## File Layout

```text
lib/movement/
  movement.types.ts       # VehicleState, DriveCommand, MovementOrder, WeaponOrder
  movement.body.ts        # MovementBody + KinematicTankBody
  movement.resolver.ts    # OrderResolver
  movement.steering.ts    # moveTo/face steer helpers, obstacle avoidance
  movement.flee.ts        # threat/boundary escape scoring
  movement.weapon.ts      # weapon order + cooldown/alignment execution

feature/controls/
  player-controller.tsx   # steps the canonical player body
```

Possible future adapters:

```text
lib/movement/adapters/yuka-resolver.ts
lib/movement/adapters/rapier-body.ts
lib/navigation/route-planner.ts
```

No external package is added in this phase. The interfaces are the extension points.

## Extensibility Seams

### Movement body

`KinematicTankBody` is the first implementation of `MovementBody`.

A future `RapierTankBody` can preserve the same API while delegating position, heading, and speed to a physics rigid body.

### Order resolution

`OrderResolver` is the seam for external steering:

- Built-in resolver first.
- Yuka adapter later.
- Route planner later.

The behavior tree never knows which resolver is active.

### World movement

`WorldMovement` starts with the world bound and obstacle list.

Later it can expose:

- spatial queries,
- route planning,
- navmesh queries,
- shared movement system services.

### Weapon execution

`WeaponOrder` separates the decision to fire from cooldown, alignment checks, and projectile creation.

The existing `Weapon` cooldown is wrapped by `DefaultWeaponExecutor` rather than replaced.

## Implementation Phases

### Phase 1: Movement core — complete

- Add movement types.
- Extract `KinematicTankBody` from `KinematicDriver`.
- Move bounds, steering, obstacle avoidance, and flee scoring into `lib/movement`.
- Add `OrderResolver`.
- Keep behavior unchanged temporarily.

### Phase 2: Behavior orders — complete

- Replace `TankIntent` with `TankDecision`.
- Convert tree nodes to emit `MovementOrder` and `WeaponOrder`.
- Remove steering and avoidance calculations from behavior nodes.
- Move damage retreat from `AIVehicle` into the behavior tree.
- Move `fireWhileMoving` into the weapon-order path.

### Phase 3: Player migration — complete

- Make the player use `KinematicTankBody`.
- Convert `KeyboardNavigator` into an input source.
- Add player movement execution outside the mesh.
- Register the canonical player body.
- Update camera, shooting, and target syncing to read canonical state.

### Phase 4: Cleanup — complete

- Remove duplicate movement logic.
- Remove or replace `PositionTracker` player-copy behavior.
- Delete unused `VehicleFleet`/`AutonomousVehicle` placeholder movement.
- Ensure `worldBound` exists only in the movement body.
- Ensure `groundVehicle` reads canonical state.

### Phase 5: Validation — automated checks complete; manual smoke test pending

- `npx tsc --noEmit`
- `pnpm build`
- Manual checks:
  - Player movement feel and camera follow.
  - Player shooting and aiming.
  - AI chase, patrol, follow, flee, and damage retreat.
  - Registry positions and target assignment.
  - Pause and replay reset.
  - No movement duplication or mesh lag.

## Acceptance Criteria

- Behavior tree actions contain no direct steering, avoidance, or position integration.
- `Chase`, `Flee`, `FollowLeader`, `Patrol`, and aim actions emit orders only.
- Player and AI both use `MovementBody`.
- The player has a canonical body with live `speed`.
- The unit registry exposes the canonical body for every unit.
- Camera and shooting read canonical state, not the render mesh.
- `worldBound` and integration live in one movement implementation.
- Damage retreat is decided by the behavior tree, not an `AIVehicle` movement override.
- `npx tsc --noEmit` and `pnpm build` pass.

## Affected Files

Expected primary changes:

- `lib/tanks/tanks.types.ts`
- `lib/tanks/tanks.config.ts`
- `lib/tanks/tanks.locomotion.ts`
- `lib/tanks/tanks.steering.ts`
- `lib/tanks/tanks.flee.ts`
- `lib/tanks/nodes/actions/*`
- `lib/tanks/nodes/conditions/*`
- `lib/tanks/tanks.trees.ts`
- `lib/tanks/tanks.builder.ts`
- `feature/vehciles/ai-vehicle.tsx`
- `feature/controls/keyboard-navigator.tsx`
- `feature/camera/player-camera.tsx`
- `feature/scene/player-unit.tsx`
- `feature/scene/position-tracker.tsx`
- `feature/scene/scene.tsx`
- `feature/three/shooting.tsx`
- `feature/vehciles/fleet.tsx` (remove unused implementation)

New files added:

- `lib/movement/movement.types.ts`
- `lib/movement/movement.body.ts`
- `lib/movement/movement.resolver.ts`
- `lib/movement/movement.steering.ts`
- `lib/movement/movement.flee.ts`
- `lib/movement/movement.weapon.ts`
- `feature/controls/player-controller.tsx`

## Design Constraints

- Do not add Yuka, Rapier, or navigation packages yet.
- Define interfaces so those can be added later.
- Keep per-frame paths allocation-light.
- Keep behavior trees detached from render objects and direct driver mutation.
- Keep combat targeting and squad allocation behavior unchanged.
- Preserve existing tuning values where possible.
- Avoid positive `useFrame` priorities.

## Out of Scope

- New obstacle or navmesh system.
- Route planning implementation.
- Physics-based collision response.
- Gameplay balance changes.
- New weapon mechanics.

## Open Questions

- Whether the player should emit only `steer` input or also support direct heading targets for future gamepad/mouse steering.
- Whether `Patrol` waypoint selection remains in the tree or moves into a dedicated behavior service.
- Whether movement execution stays per-unit initially or moves to a single central movement system once obstacle queries become shared.
