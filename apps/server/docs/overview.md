# System Overview

This document provides a high-level overview of the Toyota Wars game architecture, focusing on how components interact with each other. For detailed implementation information, see the individual component documentation.

## Architecture at a Glance

Toyota Wars is a 3D vehicle combat game built with Next.js and React Three Fiber. The system is organized into several interconnected modules that work together to create an engaging combat experience.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Game Loop                                │
│                    (React Three Fiber)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│   3D Scene      │ │   Combat     │ │     AI       │
│   (Rendering)   │ │  (System)    │ │  (Behavior)  │
└────────┬────────┘ └──────┬───────┘ └──────┬───────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                    ┌─────┴─────┐
                    │  Shared    │
                    │   State    │
                    └────────────┘
```

## Core Components

### 1. 3D Scene System

**Purpose**: Renders the game world and handles visual presentation

**Key Responsibilities**:

- Terrain rendering with procedural hills
- Vehicle and projectile visualization
- Lighting, fog, and atmospheric effects
- Camera management

**Interaction Points**:

- Receives vehicle positions from AI system
- Receives projectile data from combat system
- Displays health bars based on combat state
- Passes player input to combat system

**Related Documentation**: (Scene components are part of the main application architecture)

### 2. Combat System

**Purpose**: Manages all combat-related game logic

**Key Responsibilities**:

- Health tracking for all units
- Projectile physics and collision detection
- Damage application
- Target selection and scoring
- Player aiming controls

**Interaction Points**:

- **→ AI System**: Provides target selection logic for squad coordination
- **→ 3D Scene**: Supplies projectile positions and health data for rendering
- **← Player Input**: Receives aiming input via controls
- **← AI System**: Receives fire requests from AI units

**Data Flow**:

```
Player Input → Aiming System → Projectile System → Collision Detection → Health Updates
AI Fire Request → Projectile System → Collision Detection → Health Updates
Health State → Health Bars (Scene)
```

**Related Documentation**: [combat.md](./combat.md)

### 3. Behavior Tree System

**Purpose**: Provides decision-making architecture for AI

**Key Responsibilities**:

- Hierarchical AI decision structure
- Node evaluation framework
- State management (SUCCESS, FAILURE, RUNNING)
- Composition of complex behaviors from simple nodes

**Interaction Points**:

- **→ Tanks System**: Provides base classes for tank-specific nodes
- **← Tanks System**: Uses BTSelector and BTSequence for tank behavior trees
- **← AI Components**: Evaluates behavior trees each frame

**Data Flow**:

```
Game Context → Behavior Tree → Node Evaluation → Action Execution → Context Update
```

**Related Documentation**: [behavior-tree.md](./behavior-tree.md)

### 4. Tanks System

**Purpose**: Implements tank-specific AI behaviors

**Key Responsibilities**:

- Tank movement and steering
- Combat actions (chase, shoot, patrol)
- Obstacle avoidance
- Integration with behavior tree nodes

**Interaction Points**:

- **← Behavior Tree**: Extends BTNode for tank-specific actions
- **→ Squad System**: Uses squad manager for target assignment
- **→ Combat System**: Queries target selection logic
- **→ 3D Scene**: Provides vehicle positions for rendering

**Data Flow**:

```
Squad Target → Chase/Attack Nodes → Movement → Position Update → Scene Render
```

**Related Documentation**: [tanks.md](./tanks.md)

### 5. Squad Management System

**Purpose**: Coordinates AI units for efficient target distribution

**Key Responsibilities**:

- Target allocation among squad members
- Dynamic reassignment when targets are destroyed
- Prevention of target overcrowding
- Coordination with combat target selection

**Interaction Points**:

- **← Combat System**: Uses target selection scoring algorithm
- **→ Tanks System**: Provides assigned targets via AssignSquadTargetAction
- **→ AI Components**: Updates allocations each frame

**Data Flow**:

```
Unit Positions + Enemy Targets → Squad Manager → Target Assignments → AI Behavior Trees
```

**Related Documentation**: [squad.md](./squad.md)

## System Interactions

### Game Loop Flow

Each frame, the following sequence occurs:

1. **Input Processing**
   - Player aiming is updated via mouse/keyboard
   - Squad manager recalculates target allocations

2. **AI Decision Making**
   - Each AI unit's behavior tree is evaluated
   - Context includes position, targets, obstacles
   - Actions like chase, shoot, or patrol are executed

3. **Combat Resolution**
   - Projectiles move and check for collisions
   - Health is updated on hits
   - Destroyed units are removed

4. **Rendering**
   - Vehicle positions are synced to 3D scene
   - Health bars reflect current health
   - Projectiles are rendered

### Component Interaction Map

```
┌────────────────────────────────────────────────────────────────┐
│                        AI Vehicle                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Behavior Tree (Tanks System)                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Squad Manager → Assign Target                    │  │  │
│  │  │  Combat System → Check Range/Select Best          │  │  │
│  │  │  Tank Nodes → Chase/Shoot/Patrol                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      Combat System                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Target Selection (used by Squad Manager)               │  │
│  │  Projectile System (fired by AI and Player)              │  │
│  │  Health Tracking (read by Health Bars)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                        3D Scene                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vehicle Rendering (positions from AI)                  │  │
│  │  Projectile Rendering (data from Combat)               │  │
│  │  Health Bars (health from Combat)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### AI Target Engagement

```
1. Squad Manager.updateAllocations()
   ├─ Input: Squad member positions, enemy targets, health map
   ├─ Process: Calls Combat.selectBestTarget() for each member
   └─ Output: Target allocation map

2. AI Vehicle Behavior Tree
   ├─ AssignSquadTargetAction node
   │  ├─ Queries Squad Manager for assigned target
   │  └─ Sets context.targetPosition
   ├─ CheckTargetInRange node
   │  └─ Checks distance to target
   ├─ ChaseWithAvoidanceAction node
   │  ├─ Updates position toward target
   │  └─ Avoids obstacles
   └─ ShootTargetAction node
      ├─ Fires projectile via Combat system
      └─ Triggers projectile spawning

3. Combat System
   ├─ Projectile moves and checks collision
   ├─ On hit: Updates health map
   └─ Health bars reflect new health
```

### Player Combat

```
1. Player Input
   ├─ Mouse movement → Updates aim position
   ├─ Keyboard (I/J/K/L) → Fine aim adjustment
   └─ Spacebar → Fire trigger

2. Combat System
   ├─ Aiming controls process input
   ├─ Raycast from camera through aim point
   ├─ Fire projectile from player position
   └─ Projectile system handles movement/collision

3. 3D Scene
   ├─ Renders reticle at aim position
   ├─ Renders projectile in flight
   └─ Health bars update on hit
```

### Dynamic Squad Reassignment

```
1. Enemy unit destroyed (health reaches 0)

2. Next frame:
   ├─ Squad Manager.updateAllocations()
   │  ├─ Clears previous allocations
   │  ├─ selectBestTarget() ignores destroyed enemy
   │  └─ Reassigns units that were targeting it
   ├─ AI vehicles get new targets
   └─ Behavior trees adapt to new targets
```

## Key Architectural Patterns

### Hierarchical AI

AI behavior is organized hierarchically:

- **High-level**: Squad coordination (which target to engage)
- **Mid-level**: Behavior tree decision (chase vs shoot vs patrol)
- **Low-level**: Individual actions (move, fire, turn)

### Shared State

Combat state (health, positions) is shared across systems:

- Combat system maintains health map
- Squad system reads health for target selection
- 3D scene reads health for rendering
- AI system reads health for decision making
- `PlainsProvider` shares battle and player runtime state with both the Canvas and HUD

See [context.md](./context.md) for the implemented single-provider setup and the planned split-context architecture.

### Event-Driven Updates

Many systems update reactively:

- Projectile fire → Collision detection → Health update → UI update
- Target destruction → Squad reassignment → AI re-targeting
- Player input → Aiming update → Projectile fire

### Component Decoupling

Systems are designed to be independent:

- Behavior tree system has no knowledge of tanks or combat
- Squad system only needs target selection interface
- Combat system doesn't know about behavior trees
- Integration happens through well-defined interfaces

## Module Dependencies

```
Behavior Tree System
  ↓ (extended by)
Tanks System
  ↓ (uses)
Squad Management System
  ↓ (uses)
Combat System
  ↓ (read by)
3D Scene System
```

**Independence**: Each module can be tested and understood independently
**Integration**: Modules connect through clear interfaces
**Flexibility**: Modules can be replaced or extended without affecting others

## File Organization

```
lib/
├── behavior-tree/    # Core AI decision framework
├── tanks/           # Tank-specific AI behaviors
├── squad/           # Squad coordination
└── combat/          # Combat logic

feature/
├── scene/           # 3D scene setup
├── combat/          # Combat UI (health bars)
├── controls/        # Input handling
├── terrain/         # Terrain components
├── three/           # Three.js utilities
└── vehciles/        # Vehicle components

hooks/
└── use-aim-controls.ts  # Aiming input hook
```

## Learning Path

For developers new to the codebase, recommended reading order:

1. **This Document** (overview.md) - Understand the big picture
2. **Behavior Tree Documentation** (behavior-tree.md) - Learn the AI framework
3. **Combat Documentation** (combat.md) - Understand game mechanics
4. **Tanks Documentation** (tanks.md) - See tank-specific implementation
5. **Squad Documentation** (squad.md) - Learn coordination logic
6. **Selector Documentation** (selector.md) - Understand utility-based intent selection
7. **Utility Documentation** (utility.md) - See how tank intents are scored and wired

## Related Documentation

- [behavior-tree.md](./behavior-tree.md) - Detailed behavior tree architecture
- [tanks.md](./tanks.md) - Tank AI system implementation
- [combat.md](./combat.md) - Combat system details
- [squad.md](./squad.md) - Squad management system
- [selector.md](./selector.md) - Utility selector scoring and intent selection
- [utility.md](./utility.md) - Tank utility options and intent definitions
- [context.md](./context.md) - Context architecture and planned split-context design
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall project architecture
- [README.md](../README.md) - Game overview and getting started
