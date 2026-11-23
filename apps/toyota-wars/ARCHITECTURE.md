# Architecture

Technical documentation for Toyota Wars, including project structure, configuration, and system architecture.

## Tech Stack

- **Framework**: Next.js 16.4.0 (App Router)
- **Language**: TypeScript 5.7.3
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei, Babylon.js
- **Styling**: Tailwind CSS 4.3.3, shadcn components
- **Package Manager**: pnpm 12.3.4
- **Analytics**: Vercel Analytics

## Project Structure

```
toyota-wars/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with analytics
│   ├── page.tsx           # Main page entry point
│   └── globals.css        # Global styles
├── feature/               # Feature modules
│   ├── combat/            # Combat UI components
│   │   ├── aim.ts         # Aiming mechanics
│   │   └── health-bar.tsx # Health bar UI
│   ├── controls/          # Input handling
│   │   └── keyboard-navigator.tsx
│   ├── scene/             # 3D scene setup
│   │   ├── scene.tsx      # Main scene component
│   │   ├── scene-overlay.tsx
│   │   └── scene-reticle.tsx
│   ├── terrain/           # Terrain components
│   │   ├── distant-rock.tsx
│   │   └── grass-patches.tsx
│   ├── three/             # Three.js utilities
│   │   ├── shooting.tsx   # Projectile system
│   │   └── terrain-height.ts
│   └── vehciles/          # Vehicle components
│       ├── vehicle.tsx    # Base vehicle component
│       ├── fleet.tsx      # Fleet management
│       ├── ally-vehicles.tsx
│       └── opponent-vehicles.tsx
├── lib/                   # Core libraries
│   ├── behavior-tree/     # AI behavior tree system
│   │   ├── behavior-tree.config.ts
│   │   └── behavior-tree.core.ts
│   ├── combat/            # Combat logic
│   │   ├── combat.config.ts
│   │   ├── combat.targets.ts
│   │   └── combat.types.ts
│   ├── squad/             # Squad management
│   ├── tanks/             # Tank AI nodes
│   ├── vehicles/          # Vehicle platforms & loadouts
│   ├── weapons/           # Weapon profiles, effects & projectiles
│   │   ├── tanks.config.ts
│   │   ├── tanks.nodes.ts
│   │   ├── tanks.types.ts
│   │   └── tanks.utils.ts
│   ├── app.js             # App utilities
│   ├── palettes.ts        # Color palettes
│   └── utils.ts           # General utilities
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

## Configuration

### Combat Config

Located in `lib/combat/combat.config.ts`:

- `MAX_HEALTH`: 100
- `HIT_DAMAGE`: 25
- `HIT_RADIUS`: 2.0
- `MAX_TARGET_RANGE`: 50.0
- Projectile speed and lifetime settings

### Tank Config

Located in `lib/tanks/tanks.config.ts`:

- Movement speed and steering
- Combat settings (shoot interval, angle offset)
- Avoidance parameters

## AI Behavior Tree

The AI system uses a behavior tree architecture for autonomous decision making.

### Core Components

- **BTNode**: Abstract base class for all nodes
- **BTSelector**: OR logic - runs children until one succeeds
- **BTSequence**: AND logic - runs children until one fails

### Node States

- `SUCCESS`: Node completed successfully
- `FAILURE`: Node failed
- `RUNNING`: Node is still processing

### Tank-Specific Nodes

#### Conditions

- **CheckTargetInRange**: Verifies if a target is within specified range
- **CheckAlignedWithTarget**: Checks if the tank is facing the target

#### Actions

- **ChaseTargetAction**: Drives straight toward the target with smooth steering
- **ChaseWithAvoidanceAction**: Pursues target while avoiding obstacles
- **ShootTargetAction**: Fires weapon when cooldown is ready
- **PatrolAction**: Performs gentle circling patrol behavior
- **AssignSquadTargetAction**: Assigns squad-level targets to individual units

### Squad Management

The squad system coordinates multiple AI units:

- Target assignment based on unit proximity
- Distributed target selection to prevent all units from focusing on one enemy
- Dynamic target reassignment when enemies are destroyed

## 3D Scene Architecture

### Scene Components

- **Canvas**: React Three Fiber canvas with camera and rendering settings
- **Lighting**: Ambient light, directional light with shadows, and sky simulation
- **Terrain**: Procedural height-based terrain with grass patches
- **Fog**: Atmospheric fog for depth perception
- **Rocks**: Distant rock formations for environmental detail

### Vehicle Rendering

Vehicles are rendered as 3D groups with:

- Tank body geometry
- Health bar overlay
- Dynamic terrain height sampling
- Team-specific color palettes

### Projectile System

- Object pooling for performance (max 60 projectiles)
- Physics-based movement with gravity
- Collision detection using hit radius
- Automatic cleanup after lifetime expires

## Performance Considerations

- Object pooling for projectiles to reduce garbage collection
- Reuse of Vector3 instances in AI nodes to prevent memory allocation
- Efficient terrain height sampling
- Lazy evaluation in behavior tree nodes
