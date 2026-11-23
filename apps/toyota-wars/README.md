# Toyota Wars

A 3D vehicle combat game set in a procedural Kordofan-inspired plain. Players control tanks in tactical combat against AI opponents using advanced behavior tree AI.

## Features

### 3D Combat Environment

- Procedural terrain with Kordofan-inspired hills
- Dynamic grass patches and distant rock formations
- Atmospheric fog and realistic lighting with sky simulation
- Shadow mapping for visual depth

### Vehicle System

- Player-controlled tank with keyboard navigation
- Autonomous AI vehicles with behavior tree decision making
- Two opposing teams (ally vs enemy)
- Health bars with team-specific colors
- Dynamic terrain snapping for realistic movement

### Combat Mechanics

- Projectile-based shooting system
- Health tracking and damage system
- Target detection and aiming mechanics
- Cooldown-based weapon systems
- 10v10 fleet combat support

### AI System

- Behavior tree architecture for autonomous decision making
- Squad-based target assignment
- Coordinated team attacks
- Intelligent pathfinding with obstacle avoidance

## Getting Started

### Prerequisites

- Node.js 20 (use NVM to switch)
- pnpm 12.3.4

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Formatting

```bash
# Format code with Prettier
pnpm format
```

## Controls

- **Keyboard Navigation**: Move the player tank
- **Aiming**: Automatic target detection
- **Shooting**: Fire projectiles at enemies

## Architecture

For detailed technical documentation, project structure, and configuration, see [ARCHITECTURE.md](./ARCHITECTURE.md).

Mission-specific documentation:

- [Mission System](./docs/missions.md) — definitions, validation, runtime, snapshots, HUD, and current AI coupling.
- [Mission State to Squad Directive Plan](./docs/missions-plan.md) — the roadmap for separating objective conditions from AI directives.

## License

Private
