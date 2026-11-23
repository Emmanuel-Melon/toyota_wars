# Behavior Tree System

This document describes the behavior tree AI system used in Toyota Wars for autonomous vehicle decision-making.

## Overview

Behavior trees are a hierarchical pattern for AI decision-making. They provide a structured way to model complex behaviors by breaking them down into simple, reusable nodes. In Toyota Wars, behavior trees control AI tank movement, combat decisions, and patrol behaviors.

### Why Behavior Trees?

- **Modular**: Complex behaviors built from simple, reusable nodes
- **Readable**: Tree structure makes AI logic easy to understand
- **Flexible**: Easy to add new behaviors or modify existing ones
- **Performant**: Efficient evaluation suitable for real-time games

## Core Architecture

### Node States

Every behavior tree node returns one of three states:

```typescript
enum NodeState {
  SUCCESS = "SUCCESS", // Node completed successfully
  FAILURE = "FAILURE", // Node failed to complete
  RUNNING = "RUNNING", // Node is still processing (e.g., multi-frame action)
}
```

- **SUCCESS**: The node's task was completed
- **FAILURE**: The node's task could not be completed
- **RUNNING**: The node is in progress (used for actions that span multiple frames)

### BTNode

Abstract base class for all behavior tree nodes.

```typescript
abstract class BTNode {
  abstract evaluate(context: any): NodeState;
}
```

Every node must implement the `evaluate` method, which receives a context object containing relevant game state and returns a `NodeState`.

### BTSelector

Implements OR logic - runs children in order until one succeeds.

```
┌─────────────────┐
│   BTSelector    │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
  Child1   Child2   Child3   Child4
```

**Behavior**: Evaluates children from left to right. Returns the first non-FAILURE result. If all children fail, returns FAILURE.

**Use Cases**:

- Choosing between multiple possible actions
- Fallback behaviors (try primary, if that fails, try secondary)
- Priority-based decision making

**Example**:

```typescript
const selector = new BTSelector([
  new ShootAction(), // Try shooting first
  new ChaseAction(), // If can't shoot, chase
  new PatrolAction(), // If nothing else, patrol
]);
```

### BTSequence

Implements AND logic - runs children in order until one fails.

```
┌─────────────────┐
│   BTSequence    │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
  Child1   Child2   Child3   Child4
```

**Behavior**: Evaluates children from left to right. Returns FAILURE on first failure. Returns SUCCESS only if all children succeed.

**Use Cases**:

- Sequences of actions that must all complete
- Preconditions before an action
- Multi-step behaviors

**Example**:

```typescript
const sequence = new BTSequence([
  new CheckTargetInRange(50), // First check if target is close
  new CheckAlignedWithTarget(), // Then check if facing target
  new ShootAction(), // Then shoot
]);
```

## Tank-Specific Implementation

### TankContext

The context object passed to tank AI nodes contains all necessary game state:

```typescript
interface TankContext {
  position: THREE.Vector3; // Current position
  angle: number; // Current rotation angle (radians)
  speed: number; // Movement speed
  delta: number; // Time since last frame (seconds)
  targetPosition: THREE.Vector3 | null; // Current target
  fireCooldown: number; // Weapon cooldown timer
  shootInterval?: number; // Time between shots
  obstacles?: Obstacle[]; // Obstacles to avoid
  unitId?: string | number; // This unit's ID
  squadManager?: SquadManager; // Squad coordination
  allTargets?: Target[]; // All available targets
  onShoot?: (position: THREE.Vector3, angle: number) => void; // Shoot callback
}
```

### Configuration

Tank behavior is configured via `TANK_CONFIG`:

```typescript
const TANK_CONFIG = {
  movement: {
    defaultSpeed: 1.5, // Base movement speed
    patrolSpeedMultiplier: 0.6, // Speed multiplier during patrol
    patrolRotationSpeed: 0.4, // Rotation speed during patrol
    steeringLerpSpeed: 5.0, // Steering smoothness
  },
  combat: {
    defaultShootInterval: 2.0, // Seconds between shots
    defaultMaxAngleOffsetRad: 0.25, // Max angle offset for shooting
  },
  avoidance: {
    defaultRadius: 4.5, // Default obstacle avoidance radius
    pushMultiplier: 2.0, // Avoidance force multiplier
  },
};
```

### Condition Nodes

Condition nodes check game state and return SUCCESS or FAILURE without side effects.

#### CheckTargetInRange

Checks if a target is assigned and within a specified range.

```typescript
class CheckTargetInRange extends BTNode {
  constructor(private range: number);
}
```

**Returns**: SUCCESS if target exists and distance ≤ range, otherwise FAILURE

**Use Case**: Determine if engagement is possible

#### CheckAlignedWithTarget

Checks if the tank is facing the target within an acceptable angle.

```typescript
class CheckAlignedWithTarget extends BTNode {
  constructor(private maxAngleOffsetRad: number = 0.25);
}
```

**Returns**: SUCCESS if facing within angle tolerance, otherwise FAILURE

**Use Case**: Verify tank is properly aimed before shooting

### Action Nodes

Action nodes perform behaviors and may return RUNNING for multi-frame actions.

#### ChaseTargetAction

Drives straight toward the target with smooth steering.

```typescript
class ChaseTargetAction extends BTNode {
  evaluate(context: TankContext): NodeState {
    // Updates context.position and context.angle
    return NodeState.RUNNING; // Continues until arrival
  }
}
```

**Returns**: RUNNING (continues until at target) or SUCCESS (arrived)

**Side Effects**: Updates `context.position` and `context.angle`

#### ChaseWithAvoidanceAction

Drives toward target while avoiding obstacles.

```typescript
class ChaseWithAvoidanceAction extends BTNode {
  evaluate(context: TankContext): NodeState {
    // Uses context.obstacles to steer away
    // Updates context.position and context.angle
    return NodeState.RUNNING;
  }
}
```

**Returns**: RUNNING (continues until at target) or SUCCESS (arrived)

**Side Effects**: Updates `context.position` and `context.angle`

**Obstacle Avoidance**:

- Reads obstacles from `context.obstacles`
- Applies repulsive force when within radius
- Combines target direction with avoidance vector

#### ShootTargetAction

Fires weapon when cooldown is ready.

```typescript
class ShootTargetAction extends BTNode {
  constructor(private onCooldown: NodeState = NodeState.FAILURE);
}
```

**Returns**: SUCCESS (fired) or FAILURE (on cooldown)

**Side Effects**: Calls `context.onShoot()` and sets `context.fireCooldown`

#### PatrolAction

Performs gentle circling patrol behavior.

```typescript
class PatrolAction extends BTNode {
  evaluate(context: TankContext): NodeState {
    // Updates context.position and context.angle
    return NodeState.RUNNING; // Never completes
  }
}
```

**Returns**: RUNNING (continuous patrol)

**Side Effects**: Updates `context.position` and `context.angle` in a circular pattern

#### AssignSquadTargetAction

Assigns a squad-level target to this unit.

```typescript
class AssignSquadTargetAction extends BTNode {
  evaluate(context: TankContext): NodeState {
    // Reads from context.squadManager and context.allTargets
    // Sets context.targetPosition
    return NodeState.SUCCESS;
  }
}
```

**Returns**: SUCCESS (target assigned) or FAILURE (no valid target)

**Side Effects**: Sets `context.targetPosition`

**Integration**: Works with squad manager to distribute targets among units

## Usage Guide

### Creating a Behavior Tree

Behavior trees are constructed by composing nodes:

```typescript
import { BTSelector, BTSequence } from "@/lib/behavior-tree/behavior-tree.core";
import {
  ChaseWithAvoidanceAction,
  CheckAlignedWithTarget,
  CheckTargetInRange,
  PatrolAction,
  ShootTargetAction,
} from "@/lib/tanks/nodes";

const behaviorTree = new BTSelector([
  // Priority 1: Combat
  new BTSequence([
    new CheckTargetInRange(35), // Check if in range
    new BTSelector([
      // If aligned, shoot
      new BTSequence([
        new CheckAlignedWithTarget(0.35),
        new ShootTargetAction(),
      ]),
      // Otherwise, chase
      new ChaseWithAvoidanceAction(),
    ]),
  ]),
  // Priority 2: Patrol if no combat
  new PatrolAction(),
]);
```

### Integration with React Three Fiber

Behavior trees are typically evaluated in the `useFrame` hook:

```typescript
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function AIVehicle({ initialPosition, targetPosition, obstacles, onShoot }) {
  const groupRef = useRef<THREE.Group>(null);
  const posVec = useRef(new THREE.Vector3(initialPosition[0], 0, initialPosition[1]));
  const angleRef = useRef(0);
  const cooldownRef = useRef(0);

  // Construct behavior tree once
  const behaviorTree = useMemo(() => {
    return new BTSelector([
      // ... nodes
    ]);
  }, []);

  useFrame((state, delta) => {
    // Update cooldown
    if (cooldownRef.current > 0) {
      cooldownRef.current -= delta;
    }

    // Build context
    const context = {
      position: posVec.current,
      targetPosition: targetPosition ?? null,
      obstacles,
      angle: angleRef.current,
      speed: 2.2,
      delta,
      fireCooldown: cooldownRef.current,
      shootInterval: 2.0,
      onShoot: (pos, angle) => onShoot?.(pos, angle),
    };

    // Evaluate behavior tree
    behaviorTree.evaluate(context);

    // Sync back from context
    angleRef.current = context.angle;
    cooldownRef.current = context.fireCooldown;

    // Update 3D transform
    groupRef.current.position.set(posVec.current.x, currentY, posVec.current.z);
    groupRef.current.rotation.y = angleRef.current;
  });

  return <group ref={groupRef}><Vehicle /></group>;
}
```

### Example: AI Vehicle

The complete example from `feature/vehciles/ai-vehicle.tsx`:

```typescript
const behaviorTree = useMemo(() => {
  return new BTSelector([
    // Priority 1: Combat Sequence with Squad Allocation
    new BTSequence([
      new AssignSquadTargetAction(), // 1. Pick target from squad
      new CheckTargetInRange(35), // 2. Check engagement range
      new BTSelector([
        // 3a. If aligned, shoot
        new BTSequence([
          new CheckAlignedWithTarget(0.35),
          new ShootTargetAction(),
        ]),
        // 3b. Otherwise, chase with avoidance
        new ChaseWithAvoidanceAction(),
      ]),
    ]),
    // Priority 2: Default patrol
    new PatrolAction(),
  ]);
}, []);
```

**Behavior Flow**:

1. Try to get a target from the squad manager
2. If successful, check if target is within 35 units
3. If in range, check if facing target
4. If facing, shoot; otherwise, chase
5. If no target or out of range, patrol

## Best Practices

### Node Design

- **Keep nodes focused**: Each node should do one thing well
- **Use RUNNING for multi-frame actions**: Actions that take time should return RUNNING
- **Avoid side effects in conditions**: Conditions should only check state, not modify it
- **Reuse context**: Pass all needed data through context instead of globals

### Tree Construction

- **Prioritize with selectors**: Put most important actions first in selectors
- **Group related actions**: Use sequences to group actions that belong together
- **Provide fallbacks**: Always have a default behavior (like patrol) as the last option
- **Nest logically**: Structure the tree to reflect the decision hierarchy

### Performance

- **Memoize trees**: Construct behavior trees once with `useMemo` or outside render
- **Reuse Vector3 instances**: The tank nodes reuse Vector3 objects to avoid GC
- **Minimize allocations**: Avoid creating objects inside `evaluate` methods
- **Keep context lean**: Only pass necessary data in context

### Testing

- **Test nodes in isolation**: Each node should be testable independently
- **Use mock contexts**: Create test contexts with known values
- **Verify state transitions**: Ensure nodes return correct states for different inputs
- **Test tree composition**: Verify tree structure produces expected behavior

## Extending the System

### Creating Custom Nodes

To create a custom node:

```typescript
import { BTNode } from "@/lib/behavior-tree/behavior-tree.core";
import { NodeState } from "@/lib/behavior-tree/behavior-tree.config";

class MyCustomNode extends BTNode {
  constructor(private param: number) {
    super();
  }

  evaluate(context: any): NodeState {
    // Your logic here
    if (/* condition */) {
      return NodeState.SUCCESS;
    }
    return NodeState.FAILURE;
  }
}
```

### Creating Custom Contexts

Define a context interface for your specific use case:

```typescript
interface MyContext {
  // Your specific properties
  health: number;
  enemies: Enemy[];
  // ...
}
```

Then use it in your nodes:

```typescript
class MyNode extends BTNode {
  evaluate(context: MyContext): NodeState {
    if (context.health < 10) {
      return NodeState.FAILURE;
    }
    return NodeState.SUCCESS;
  }
}
```

## Related Files

- `lib/behavior-tree/behavior-tree.config.ts` - NodeState enum
- `lib/behavior-tree/behavior-tree.core.ts` - Core node classes
- `lib/tanks/tanks.nodes.ts` - Tank-specific node implementations
- `lib/tanks/tanks.types.ts` - TankContext interface
- `lib/tanks/tanks.config.ts` - Configuration constants
- `lib/tanks/tanks.utils.ts` - Utility functions (lerpAngle)
- `feature/vehciles/ai-vehicle.tsx` - Usage example
