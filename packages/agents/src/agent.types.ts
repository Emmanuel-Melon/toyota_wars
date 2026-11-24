// packages/agents/src/agent.types.ts
import { AgentMovementOrders, AgentWeaponOrders } from "./agents.config";
import type {
  AgentObstacle,
  AgentVehicle,
  AgentWeapon,
  AgentSquadOrder,
  AgentPorts,
} from "./contracts";
import type { AgentVec3 } from "./contracts/geometry";

/**
 * ============================================================================
 * 1. Tuning & Behavioral Configuration
 * ============================================================================
 * Static or per-archetype thresholds, radii, speeds, and timing values that
 * govern how an agent perceives range, commits to actions, moves, and patrols.
 */
export interface AgentConfig {
  fireRange: number;
  fightingDistance: number;
  defaultMaxAngleOffsetRad: number;
  designatedFireRangeMultiplier: number;
  leaderLeashDistance: number;
  momentumBonus: number;
  minCommitMs: number;
  repositionClearance: number;
  repositionSampleCount: number;
  chaseSpeed: number;
  fleeSpeed: number;
  patrolSpeed: number;
  chaseStandoffDistance: number;
  stopDistance: number;
  repositionStopDistance: number;
  followArriveRadius: number;
  followSlowRadius: number;
  patrolRadius: number;
  patrolArriveRadius: number;
  patrolGiveUpAfter: number;
  patrolPause: readonly [number, number];
  bodyRadius: number;
}

/**
 * ============================================================================
 * 2. Spatial Reference & Environment Entities
 * ============================================================================
 * Lightweight spatial descriptors passed into orders and context to represent
 * nearby hazards and the squad/fireteam leader being tracked.
 */
export interface AgentThreat {
  readonly position: AgentVec3;
  readonly radius?: number;
  readonly destructible?: boolean;
}

export interface AgentLeader {
  readonly position: AgentVec3;
  readonly heading: number;
  readonly speed?: number;
}

/**
 * ============================================================================
 * 3. Execution Orders & Decision Output
 * ============================================================================
 * Discriminated unions pairing order tags from `agents.config.ts` with their
 * runtime payloads, plus the composite `AgentDecision` structure.
 */
export type AgentMovementOrder =
  | { type: typeof AgentMovementOrders.Idle }
  | { type: typeof AgentMovementOrders.Face; point: AgentVec3 }
  | {
      type: typeof AgentMovementOrders.MoveTo;
      point: AgentVec3;
      speed?: number;
      stopDistance?: number;
      slowRadius?: number;
    }
  | {
      type: typeof AgentMovementOrders.Follow;
      leader: AgentLeader;
      offset: readonly [number, number];
      arriveRadius?: number;
      slowRadius?: number;
    }
  | {
      type: typeof AgentMovementOrders.Flee;
      threats: readonly AgentThreat[];
      speed?: number;
    };

export type AgentWeaponOrder =
  | { type: typeof AgentWeaponOrders.Hold }
  | {
      type: typeof AgentWeaponOrders.FireAt;
      point: AgentVec3;
      requireAlignment?: boolean;
    };

export interface AgentDecision {
  movement: AgentMovementOrder;
  weapon: AgentWeaponOrder;
}

/**
 * ============================================================================
 * 4. Per-Tick Runtime Context
 * ============================================================================
 * Complete snapshot of an agent's self-state, target/threat awareness,
 * squad/formation relationships, hardware capabilities, configuration, ports,
 * and mutable decision output for a single evaluation tick.
 */
export interface AgentFormationState {
  standby: boolean;
}

export interface AgentContext {
  // Identity & kinematics
  unitId: string;
  position: AgentVec3;
  heading: number;
  speed: number;
  delta: number;

  // Target tracking & line of sight
  targetPosition: AgentVec3 | null;
  hasAssignedTarget: boolean;
  lastKnownPosition: AgentVec3 | null;
  blockingObstacle: AgentObstacle | null;
  lineOfSightClear: boolean;
  weaponOrigin: AgentVec3;
  obstacles: readonly AgentObstacle[];
  canFire: boolean;

  // Squad, leader & spatial bounds
  leader: AgentLeader | null;
  isSquadLeader: boolean;
  formationOffset: readonly [number, number];
  home: AgentVec3;
  bound: number;

  // Threats, morale & combat status
  threats: readonly AgentThreat[];
  retreatActive: boolean;
  routed: boolean;
  canFireWhileMoving: boolean;
  health: number;
  targetDistance: number;
  enemiesNearby: number;
  alliesNearby: number;
  leaderDistance: number;

  // Equipment & group orders
  vehicle: AgentVehicle;
  weapon: AgentWeapon;
  squadOrder: AgentSquadOrder;
  damagedNeighborsCount: number;
  retreatingNeighborsCount: number;
  formationState: AgentFormationState;

  // Dependencies & tick output
  config: AgentConfig;
  ports: AgentPorts;
  decision: AgentDecision;
}
