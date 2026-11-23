# Tanks System

This document describes the tanks AI system, including configuration, types, utilities, and integration with the behavior tree and squad management systems.

## Overview

The tanks system provides AI-controlled vehicle behavior for Toyota Wars. It combines behavior tree decision-making with tank-specific movement, combat, and coordination logic. The system is designed to be modular and extensible, allowing for easy addition of new behaviors and adjustment of parameters.

## Architecture

```
lib/tanks/
├── tanks.config.ts    # Configuration constants
├── tanks.types.ts      # TypeScript interfaces
├── tanks.utils.ts      # Utility functions
└── tanks.nodes.ts      # Behavior tree nodes
```

The tanks system integrates with:

- **Behavior Tree System** (`lib/behavior-tree/`) - Decision-making architecture
- **Squad Management** (`lib/squad/`) - Coordinated target allocation
- **Combat System** (`lib/combat/`) - Target selection and health tracking

## Configuration

### TANK_CONFIG

All tank behavior parameters are centralized in `TANK_CONFIG`:

```typescript
const TANK_CONFIG = {
  movement: {
    defaultSpeed: 1.5, // Base movement speed (units/second)
    patrolSpeedMultiplier: 0.6, // Speed multiplier during patrol (0.6 = 60% speed)
    patrolRotationSpeed: 0.4, // Rotation speed during patrol (radians/second)
    steeringLerpSpeed: 5.0, // Steering smoothness (higher = snappier)
  },
  combat: {
    defaultShootInterval: 2.0, // Time between shots (seconds)
    defaultMaxAngleOffsetRad: 0.25, // Max angle for shooting (~14 degrees)
  },
  avoidance: {
    defaultRadius: 4.5, // Default obstacle avoidance radius (units)
    pushMultiplier: 2.0, // Avoidance force multiplier
  },
};
```

### Movement Parameters

- **defaultSpeed**: Base speed for all movement actions
- **patrolSpeedMultiplier**: Tanks move slower during patrol for more realistic behavior
- **patrolRotationSpeed**: Controls how quickly tanks turn during patrol
- **steeringLerpSpeed**: Higher values make steering more responsive, lower values make it smoother

### Combat Parameters

- **defaultShootInterval**: Weapon cooldown time between shots
- **defaultMaxAngleOffsetRad**: Maximum angle deviation from target for shooting (0.25 rad ≈ 14°)

### Avoidance Parameters

- **defaultRadius**: Distance at which obstacles start affecting movement
- **pushMultiplier**: Strength of avoidance force (higher = stronger avoidance)

## Types

### TankContext

The context object passed to all tank behavior tree nodes:

```typescript
interface TankContext {
  position: THREE.Vector3; // Current position in world space
  angle: number; // Current rotation angle (radians, Y-axis)
  speed: number; // Movement speed (units/second)
  delta: number; // Time since last frame (seconds)
  targetPosition: THREE.Vector3 | null; // Current target position
  fireCooldown: number; // Weapon cooldown timer (seconds)
  shootInterval?: number; // Override for shoot interval
  obstacles?: Obstacle[]; // Obstacles to avoid
  unitId?: string | number; // This unit's unique identifier
  squadManager?: SquadManager; // Squad coordination system
  allTargets?: Target[]; // All available targets
  onShoot?: (position: THREE.Vector3, angle: number) => void; // Shoot callback
}
```

**Context Flow**:

1. Context is created each frame with current game state
2. Behavior tree nodes read from and modify context
3. After evaluation, modified values are synced back to game state

### Obstacle

Represents an obstacle that tanks should avoid:

```typescript
interface Obstacle {
  position: [number, number, number]; // World position [x, y, z]
  radius?: number; // Avoidance radius (defaults to config)
}
```

**Usage**: Passed via `context.obstacles` to avoidance nodes

### Target

Represents a potential target for engagement:

```typescript
interface Target {
  id: string | number; // Target identifier
  position: THREE.Vector3; // Target position
}
```

**Usage**: Used by squad manager and target selection logic

### SquadManager

Interface for squad-level target coordination:

```typescript
interface SquadManager {
  getTargetFor(unitId: string | number): string | number | null;
}
```

**Implementation**: See `lib/squad/squad.core.ts` for the concrete implementation

## Utilities

### lerpAngle

Shortest-arc angular interpolation that handles the ±π wrap:

```typescript
function lerpAngle(current: number, target: number, t: number): number {
  let delta = target - current;
  delta = Math.atan2(Math.sin(delta), Math.cos(delta)); // wrap to [-π, π]
  return current + delta * THREE.MathUtils.clamp(t, 0, 1);
}
```

**Why It's Needed**:

- Standard linear interpolation doesn't handle angle wrapping correctly
- When rotating from 350° to 10°, we want to go forward 20°, not backward 340°
- This function always takes the shortest path

**Parameters**:

- `current`: Current angle in radians
- `target`: Target angle in radians
- `t`: Interpolation factor (0-1)

**Example**:

```typescript
// Smoothly rotate toward target
const targetAngle = Math.atan2(dir.x, dir.z);
context.angle = lerpAngle(
  context.angle,
  targetAngle,
  Math.min(1, context.delta * TANK_CONFIG.movement.steeringLerpSpeed),
);
```

## Behavior Tree Nodes

The tanks system provides several behavior tree nodes that implement tank-specific behaviors. For detailed documentation of each node, see [behavior-tree.md](./behavior-tree.md).

### Condition Nodes

- **CheckTargetInRange**: Verifies if a target is within engagement range
- **CheckAlignedWithTarget**: Checks if the tank is facing the target

### Action Nodes

- **ChaseTargetAction**: Drives straight toward the target
- **ChaseWithAvoidanceAction**: Drives toward target while avoiding obstacles
- **ShootTargetAction**: Fires weapon when cooldown is ready
- **PatrolAction**: Performs circling patrol behavior
- **AssignSquadTargetAction**: Assigns squad-level target to this unit

## Squad Management Integration

The tanks system integrates with the squad management system for coordinated target allocation.

### SquadManager Implementation

```typescript
class SquadManager {
  private allocations: TargetAllocationMap = {};

  // Recalculates and assigns best targets for all squad members
  public updateAllocations(
    squadMembers: { id: string; position: THREE.Vector3 }[],
    enemyTargets: PotentialTarget[],
    healthMap: HealthMap,
  ): TargetAllocationMap {
    // Updates internal allocation map
    // Each member gets assigned the best available target
  }

  public getTargetFor(memberId: string): string | null {
    return this.allocations[memberId] ?? null;
  }
}
```

### Usage in Behavior Tree

```typescript
const behaviorTree = new BTSelector([
  new BTSequence([
    new AssignSquadTargetAction(), // Gets target from squad manager
    new CheckTargetInRange(35),
    // ... combat logic
  ]),
  new PatrolAction(),
]);
```

**Coordination Flow**:

1. Squad manager calculates optimal target assignments for all units
2. Each unit's behavior tree queries the squad manager via `AssignSquadTargetAction`
3. Units work together to engage different targets efficiently

## Usage Examples

### Basic Tank AI

```typescript
import { BTSelector, BTSequence } from "@/lib/behavior-tree/behavior-tree.core";
import {
  CheckTargetInRange,
  CheckAlignedWithTarget,
  ChaseWithAvoidanceAction,
  ShootTargetAction,
  PatrolAction,
} from "@/lib/tanks/nodes";

const behaviorTree = new BTSelector([
  // Combat behavior
  new BTSequence([
    new CheckTargetInRange(50),
    new BTSelector([
      new BTSequence([new CheckAlignedWithTarget(), new ShootTargetAction()]),
      new ChaseTargetAction(),
    ]),
  ]),
  // Default patrol
  new PatrolAction(),
]);
```

### Tank with Obstacle Avoidance

```typescript
import { ChaseWithAvoidanceAction } from "@/lib/tanks/nodes";

const context = {
  position: new THREE.Vector3(0, 0, 0),
  angle: 0,
  speed: 2.0,
  delta: 0.016,
  targetPosition: new THREE.Vector3(10, 0, 10),
  fireCooldown: 0,
  obstacles: [
    { position: [5, 0, 5], radius: 4.5 },
    { position: [8, 0, 3], radius: 6.0 },
  ],
};

const tree = new BTSelector([
  new BTSequence([new CheckTargetInRange(35), new ChaseWithAvoidanceAction()]),
  new PatrolAction(),
]);
```

### Coordinated Squad

```typescript
import { SquadManager } from "@/lib/squad/squad.core";
// Note: Squad target assignment is now handled at the parent component level

const squadManager = new SquadManager();

// Update squad allocations each frame
squadManager.updateAllocations(squadMembers, enemyTargets, healthMap);

// Each unit's behavior tree
const behaviorTree = new BTSelector([
  new BTSequence([
    new AssignSquadTargetAction(), // Gets assigned target
    new CheckTargetInRange(35),
    // ... combat logic
  ]),
  new PatrolAction(),
]);

// Context includes squad manager
const context = {
  // ... other properties
  unitId: "tank-1",
  squadManager: squadManager,
  allTargets: enemyTargets,
};
```

## Performance Considerations

### Object Reuse

Tank nodes reuse Vector3 instances to minimize garbage collection:

```typescript
class ChaseWithAvoidanceAction extends BTNode {
  private _toTarget = new THREE.Vector3();
  private _avoid = new THREE.Vector3();
  private _push = new THREE.Vector3();
  private _obsPos = new THREE.Vector3();
  private _finalDir = new THREE.Vector3();

  evaluate(context: TankContext): NodeState {
    // Reuse instances instead of creating new ones
    const targetDir = this._toTarget
      .subVectors(context.targetPosition, context.position)
      .setY(0);
    // ...
  }
}
```

### Configuration Optimization

- Adjust `steeringLerpSpeed` based on frame rate
- Lower `patrolSpeedMultiplier` for more relaxed patrol behavior
- Tune `avoidance.pushMultiplier` to balance responsiveness vs stability

### Context Management

- Keep context lean - only include necessary data
- Avoid large arrays in context (filter obstacles before passing)
- Use refs for persistent state between frames

## Extending the System

### Adding Custom Configuration

Add new parameters to `TANK_CONFIG`:

```typescript
const TANK_CONFIG = {
  // ... existing config
  custom: {
    newParam: 1.0,
  },
} as const;
```

### Creating Custom Types

Define new interfaces in `tanks.types.ts`:

```typescript
export interface CustomTankContext extends TankContext {
  customProperty: string;
}
```

### Adding Custom Utilities

Add new utility functions to `tanks.utils.ts`:

```typescript
export function customUtility(param: number): number {
  // Your logic
  return result;
}
```

### Creating Custom Nodes

Add new nodes to `tanks.nodes.ts`:

```typescript
export class CustomAction extends BTNode {
  evaluate(context: TankContext): NodeState {
    // Your logic
    return NodeState.SUCCESS;
  }
}
```

## Related Files

- `lib/tanks/tanks.config.ts` - Configuration constants
- `lib/tanks/tanks.types.ts` - TypeScript interfaces
- `lib/tanks/tanks.utils.ts` - Utility functions
- `lib/tanks/tanks.nodes.ts` - Behavior tree node implementations
- `lib/behavior-tree/behavior-tree.core.ts` - Core behavior tree classes
- `lib/behavior-tree/behavior-tree.config.ts` - NodeState enum
- `lib/squad/squad.core.ts` - Squad management implementation
- `lib/combat/combat.targets.ts` - Target selection logic
- `feature/vehciles/ai-vehicle.tsx` - Usage example

## See Also

- [Behavior Tree Documentation](./behavior-tree.md) - Detailed behavior tree architecture
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
