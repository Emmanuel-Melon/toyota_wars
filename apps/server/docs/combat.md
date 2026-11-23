# Combat System

This document describes the combat system for Toyota Wars, including health management, target selection, projectile physics, aiming mechanics, and damage handling.

## Overview

The combat system handles all combat-related functionality in Toyota Wars, including:

- Health tracking for all units
- Target selection and allocation for AI squads
- Projectile physics and collision detection
- Player aiming controls
- Damage application and health visualization

## Architecture

```
lib/combat/
├── combat.config.ts    # Combat and projectile configuration
├── combat.types.ts      # TypeScript interfaces and types
├── combat.core.ts       # Core combat functions
├── combat.targets.ts   # Target selection logic
└── combat.aim.ts        # Aiming state and utilities

feature/combat/
└── health-bar.tsx      # Health bar UI component

feature/three/
└── shooting.tsx        # Projectile system component

hooks/
└── use-aim-controls.ts # Aiming controls hook
```

## Configuration

### COMBAT_CONFIG

Core combat parameters:

```typescript
const COMBAT_CONFIG = {
  MAX_HEALTH: 100, // Maximum health for all units
  HIT_DAMAGE: 25, // Damage per projectile hit
  HIT_RADIUS: 2.0, // Collision radius for projectiles
  MAX_TARGET_RANGE: 50.0, // Maximum range for target selection
  PLAYER_ID: "player", // ID for the player-controlled tank
  BAR_COLORS: {
    ally: "#d27a38", // Health bar color for allies
    enemy: "#c0392b", // Health bar color for enemies
  },
};
```

### PROJECTILE_CONFIG

Projectile physics and firing parameters:

```typescript
const PROJECTILE_CONFIG = {
  MAX_PROJECTILES: 200, // Maximum active projectiles (supports 10v10)
  PROJECTILE_SPEED: 600, // Muzzle velocity (units/second)
  PROJECTILE_LIFE: 3, // Projectile lifetime (seconds)
  GRAVITY: 9.81, // Downward acceleration (units/second²)
  AIR_DRAG: 0, // Exponential velocity damping per second
  FIRE_INTERVAL: 0.18, // Minimum time between shots (seconds)
  MUZZLE_HEIGHT: 0.7, // Height of muzzle above ground
  MUZZLE_OFFSET: 2.4, // Distance from tank center to muzzle
  BOUNDS: 500, // World bounds for projectile cleanup
  TARGET_HEIGHT: 1.25, // Height of target plane for aiming
};
```

### Aiming Configuration

```typescript
const AIM_LIMIT = 0.6; // Maximum aim offset from center
const AIM_KEY_SPEED = 1.2; // Speed of keyboard aim adjustment
const AIM_START: AimState = { x: 0, y: 0 }; // Default aim position
```

## Types

### Team

Represents the two opposing teams:

```typescript
type Team = "ally" | "enemy";
```

### HealthMap

Maps unit IDs to their current health values:

```typescript
type HealthMap = Record<string, number>;
```

**Example**:

```typescript
const health: HealthMap = {
  player: 100,
  "ally-0": 75,
  "enemy-0": 50,
  "enemy-1": 0, // Destroyed
};
```

### EnemyTarget

Simple target representation for collision detection:

```typescript
type EnemyTarget = {
  id: string;
  position: [number, number, number]; // [x, y, z]
};
```

### PotentialTarget

Target representation for AI target selection:

```typescript
type PotentialTarget = {
  id: string;
  position: THREE.Vector3;
};
```

### TargetAllocationMap

Maps attackers to their assigned targets:

```typescript
type TargetAllocationMap = Record<string, string>; // attackerId -> targetId
```

**Example**:

```typescript
const allocations: TargetAllocationMap = {
  "ally-0": "enemy-1",
  "ally-1": "enemy-0",
};
```

### Projectile

Represents an active projectile in the pool:

```typescript
type Projectile = {
  active: boolean; // Whether projectile is in flight
  position: THREE.Vector3; // Current position
  velocity: THREE.Vector3; // Velocity vector
  life: number; // Remaining lifetime (seconds)
  team: "ally" | "opponent"; // Which team fired it
};
```

### ShootingHandle

Interface for firing projectiles:

```typescript
type ShootingHandle = {
  fire: (
    position: THREE.Vector3,
    angle: number,
    team: "ally" | "opponent",
  ) => void;
};
```

### AimState

Represents the player's aim offset:

```typescript
type AimState = { x: number; y: number };
```

- `x`: Horizontal offset (-AIM_LIMIT to AIM_LIMIT)
- `y`: Vertical offset (-AIM_LIMIT to AIM_LIMIT)

## Core Functions

### createHealthMap

Initializes health for all units in a match:

```typescript
function createHealthMap(allyCount: number, enemyCount: number): HealthMap;
```

**Behavior**:

- Creates health entry for player with MAX_HEALTH
- Creates health entries for all allies (`ally-0`, `ally-1`, etc.)
- Creates health entries for all enemies (`enemy-0`, `enemy-1`, etc.)

**Example**:

```typescript
const health = createHealthMap(9, 10);
// Returns: { player: 100, ally-0: 100, ..., ally-8: 100, enemy-0: 100, ... }
```

### selectBestTarget

Selects the optimal target for an attacker using a scoring system:

```typescript
function selectBestTarget(
  attackerId: string,
  attackerPos: THREE.Vector3,
  validTargets: PotentialTarget[],
  healthMap: HealthMap,
  allocations: TargetAllocationMap,
): PotentialTarget | null;
```

**Scoring Algorithm**:

1. **Distance Score** (0 to 1): Closer targets score higher

   ```typescript
   const distanceScore = Math.max(0, 1 - dist / MAX_TARGET_RANGE);
   ```

2. **Health Score** (0 to 1): Low-health targets score higher (focus fire)

   ```typescript
   const healthPercent = currentHealth / MAX_HEALTH;
   const lowHealthBonus = 1 - healthPercent;
   ```

3. **Overcrowding Penalty**: Penalizes targets already being engaged

   ```typescript
   const crowdPenalty = targetedByCount * 0.35;
   ```

4. **Final Score**: Weighted combination
   ```typescript
   const totalScore =
     distanceScore * 0.45 + lowHealthBonus * 0.35 - crowdPenalty;
   ```

**Weight Breakdown**:

- Distance: 45% (prioritize nearby targets)
- Health: 35% (prioritize wounded targets)
- Overcrowding: Variable penalty (distribute fire)

**Example**:

```typescript
const bestTarget = selectBestTarget(
  "ally-0",
  tankPosition,
  enemyTargets,
  healthMap,
  currentAllocations,
);
```

### clampAim

Clamps aim values to valid range:

```typescript
function clampAim(aim: AimState): AimState {
  return {
    x: Math.max(-AIM_LIMIT, Math.min(AIM_LIMIT, aim.x)),
    y: Math.max(-AIM_LIMIT, Math.min(AIM_LIMIT, aim.y)),
  };
}
```

**Purpose**: Ensures aim stays within the valid aiming cone

## Aiming System

### useAimControls Hook

Manages player aiming via mouse and keyboard:

```typescript
function useAimControls(
  aimRef: RefObject<AimState>,
  reticleRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
): void;
```

**Controls**:

- **Mouse**: Pointer movement updates aim position
- **Keyboard**: I/J/K/L keys for fine adjustment
  - I: Aim up
  - K: Aim down
  - J: Aim left
  - L: Aim right

**Behavior**:

1. Converts pointer position to normalized device coordinates (NDC)
2. Clamps to AIM_LIMIT
3. Updates reticle position
4. Handles keyboard aim adjustment with delta time

**Example**:

```typescript
const aimRef = useRef<AimState>({ x: 0, y: 0 });
const reticleRef = useRef<HTMLElement>(null);
const containerRef = useRef<HTMLElement>(null);

useAimControls(aimRef, reticleRef, containerRef);
```

## Health System

### HealthBar Component

Renders a health bar behind the vehicle:

```typescript
function HealthBar({
  value,
  max,
  color,
  position,
}: {
  value: number; // Current health
  max: number; // Maximum health
  color: string; // Bar color
  position?: [number, number, number];
});
```

**Features**:

- Billboarded (always faces camera)
- Dark background bar
- Colored foreground bar showing health percentage
- Smooth clipping with ratio calculation
- Rendered over geometry so rear-mounted bars stay visible

**Dimensions**:

- Width: 2.2 units
- Height: 0.26 units
- Position: behind the hull and turret, stacked vertically

**Example**:

```typescript
<HealthBar
  value={health[unitId]}
  max={COMBAT_CONFIG.MAX_HEALTH}
  color={BAR_COLORS[team]}
/>
```

## Projectile System

### Shooting Component

Manages projectile pool, physics, and collision detection:

```typescript
function Shooting({
  vehicleRef,
  aimRef,
  enemies,
  allyTargets,
  health,
  onHit,
  paused,
  shootingRef,
}: ShootingProps);
```

### Object Pooling

Projectiles use object pooling for performance:

```typescript
function createPool(): Projectile[] {
  return Array.from({ length: MAX_PROJECTILES }, () => ({
    active: false,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    team: "ally",
  }));
}
```

**Benefits**:

- Avoids garbage collection during gameplay
- Fixed memory footprint
- Fast projectile allocation

### Firing Logic

**Player Firing** (Spacebar):

1. Check cooldown
2. Raycast from camera through aim point to target plane
3. Calculate yaw and ballistic pitch to the target
4. Fire projectile from the muzzle with the current bloom spread

**AI Firing** (via shootingRef):

```typescript
const fire = (
  position: THREE.Vector3,
  angle: number,
  team: "ally" | "opponent",
) => {
  // Fires projectile from position at angle
};
```

### Projectile Physics

**Movement**:

```typescript
projectile.velocity.y -= gravity * delta;
if (drag > 0) {
  projectile.velocity.multiplyScalar(Math.exp(-drag * delta));
}
projectile.position.addScaledVector(projectile.velocity, delta);
projectile.life -= delta;
```

**Velocity Calculation**:

```typescript
const horizontal = Math.cos(pitch);
const dir = new THREE.Vector3(
  Math.sin(angle) * horizontal,
  Math.sin(pitch),
  Math.cos(angle) * horizontal,
);
muzzle.addScaledVector(dir, MUZZLE_OFFSET);
velocity.copy(dir).multiplyScalar(PROJECTILE_SPEED);
```

**Ballistic Compensation**:

```typescript
const timeOfFlight = horizontalDistance / muzzleSpeed;
const drop = 0.5 * gravity * timeOfFlight * timeOfFlight;
const adjustedTargetY = target.y + drop;
```

Player and AI fire requests use the calculated pitch. Turret visuals use the
same gravity compensation so the barrel points where the shell will land.

### Predictive Lead Reticle

`calculatePredictedIntercept` in `lib/combat/combat.prediction.ts` iterates the
target's future position and gravity drop two to three times per frame. It uses
the same muzzle speed and gravity as the cannon, so the HUD marker matches the
projectile arc.

`projectWorldToScreen` in `lib/combat/combat.hud.ts` converts that world-space
intercept into pixel coordinates. `LeadReticleUpdater` runs inside the canvas and
updates one marker per living enemy in `LeadReticleLayer`.

### Collision Detection

Uses segment-to-sphere collision detection:

```typescript
// Calculate segment from previous to current position
const seg = projectile.position.sub(prevPosition);
const segLenSq = seg.lengthSq();

// Find closest point on segment to target center
const t = clamp(toCenter.dot(seg) / segLenSq, 0, 1);
const closest = prevPosition.addScaledVector(seg, t);

// Check if within hit radius
const hit = closest.distanceToSquared(targetCenter) <= HIT_RADIUS * HIT_RADIUS;
```

`intersectSegmentSphere` in `lib/combat/combat.collision.ts` provides the same
segment test while returning the closest contact point for impact effects. The
projectile loop keeps using `segmentSphereT` so it can select the earliest hit
across multiple targets and hitboxes.

**Why Segment Detection**:

- Fast projectiles can skip over targets in a single frame
- Segment detection ensures no missed collisions
- More accurate than point-based collision

**Target Selection**:

- Ally projectiles test against enemies
- Opponent projectiles test against allies and player

### Impact Audio

`ProceduralAudio.playMetalImpact` in `lib/audio/audio.procedural.ts` synthesizes
a short filtered noise burst with Web Audio. `ProjectileSystemLayer` calls it
before forwarding each hit to `CombatContext`, so no external sound assets are
required.

`ProceduralGunshot.playHeavyMG` in `lib/audio/audio.gunshot.ts` synthesizes the
muzzle blast. `ProjectileSystem` plays it only when a projectile slot is
successfully spawned, covering both player and AI fire.

`ProceduralAudio.playVehicleCollision` synthesizes a low thud plus metallic
noise, scaled by closing speed. `VehicleCollisionSystem` plays it once per new
vehicle contact, even when friendly fire prevents damage.

### Cleanup

Projectiles are deactivated when:

- Life expires (PROJECTILE_LIFE)
- Out of bounds (BOUND check)
- Collision occurs
- Projectile reaches the terrain surface

## Usage Examples

### Basic Combat Setup

```typescript
import { createHealthMap } from "@/lib/combat/combat.core";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";

// Initialize health for 9 allies and 10 enemies
const health = createHealthMap(9, 10);

// Apply damage
const onHit = (id: string) => {
  health[id] = Math.max(0, health[id] - COMBAT_CONFIG.HIT_DAMAGE);
};
```

### Target Selection

```typescript
import { selectBestTarget } from "@/lib/combat/combat.targets";

const bestTarget = selectBestTarget(
  "ally-0",
  myTank.position,
  enemyTargets,
  healthMap,
  squadAllocations,
);

if (bestTarget) {
  // Engage this target
}
```

### Player Aiming

```typescript
import { useAimControls } from "@/hooks/use-aim-controls";
import { useRef } from "react";

const aimRef = useRef<AimState>({ x: 0, y: 0 });
const reticleRef = useRef<HTMLElement>(null);
const containerRef = useRef<HTMLElement>(null);

useAimControls(aimRef, reticleRef, containerRef);
```

### Health Bar Usage

```typescript
import { HealthBar } from "@/feature/combat/health-bar";
import { BAR_COLORS } from "@/lib/combat/combat.config";

<HealthBar
  value={health[unitId]}
  max={COMBAT_CONFIG.MAX_HEALTH}
  color={BAR_COLORS[team]}
  position={[0, 0.95, -2.55]}
/>
```

### Projectile System Integration

```typescript
import { Shooting } from "@/feature/three/shooting";

<Shooting
  vehicleRef={vehicleRef}
  aimRef={aimRef}
  enemies={enemyTargets}
  allyTargets={allyTargets}
  health={health}
  onHit={handleHit}
  paused={paused}
  shootingRef={shootingRef}
/>
```

### AI Firing

```typescript
// Expose shooting handle to AI
const shootingRef = useRef<ShootingHandle | null>(null);

// AI can fire via the handle
shootingRef.current?.fire(tankPosition, angle, "opponent");
```

## Performance Considerations

### Object Pooling

- Pre-allocate MAX_PROJECTILES (200) at startup
- Reuse inactive projectiles instead of creating new ones
- Avoids GC pauses during combat

### Collision Optimization

- Only test against valid targets (health > 0)
- Use squared distance comparisons (avoid sqrt)
- Segment detection prevents tunneling

### Target Selection

- Cache allocations between frames
- Only recalculate when squad composition changes
- Use early termination for invalid targets

### Health Updates

- Use simple numeric operations (no complex calculations)
- Batch updates if many units take damage simultaneously
- Consider event-based updates for large battles

## Extending the System

### Adding New Teams

```typescript
// combat.types.ts
type Team = "ally" | "enemy" | "neutral";

// combat.config.ts
BAR_COLORS: {
  ally: "#d27a38",
  enemy: "#c0392b",
  neutral: "#888888",
}
```

### Custom Damage Types

```typescript
// combat.types.ts
type DamageType = "projectile" | "explosion" | "crash";

// combat.config.ts
DAMAGE_MULTIPLIERS: {
  projectile: 1.0,
  explosion: 2.0,
  crash: 0.5,
}
```

### Projectile Variants

```typescript
// combat.types.ts
type ProjectileType = "standard" | "explosive" | "homing";

type Projectile = {
  // ... existing fields
  type: ProjectileType;
  damage: number;
  radius: number;
};
```

### Custom Target Scoring

```typescript
// combat.targets.ts
function selectBestTarget(
  // ... existing params
  customScoring?: (target: PotentialTarget) => number,
): PotentialTarget | null {
  // Use custom scoring if provided
  const score = customScoring?.(target) ?? calculateDefaultScore(target);
}
```

## Related Files

- `lib/combat/combat.config.ts` - Combat and projectile configuration
- `lib/combat/combat.types.ts` - TypeScript interfaces
- `lib/combat/combat.core.ts` - Core combat functions
- `lib/combat/combat.targets.ts` - Target selection logic
- `lib/combat/combat.aim.ts` - Aiming utilities
- `feature/combat/health-bar.tsx` - Health bar component
- `feature/three/shooting.tsx` - Projectile system
- `hooks/use-aim-controls.ts` - Aiming controls hook
- `lib/squad/squad.core.ts` - Squad management (uses target selection)

## See Also

- [Tanks Documentation](./tanks.md) - Tank AI system
- [Behavior Tree Documentation](./behavior-tree.md) - AI decision-making
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall system architecture
