import type { AgentConfig } from "./config";
import type { AgentLeader, AgentDecision, AgentThreat } from "./decision";
import type {
  AgentObstacle,
  AgentSquadOrder,
  AgentVehicle,
  AgentWeapon,
} from "./domain";
import type { AgentVec3 } from "./geometry";
import type { AgentPorts } from "./ports";

export interface AgentFormationState {
  standby: boolean;
}

export interface AgentContext {
  unitId: string;
  position: AgentVec3;
  heading: number;
  speed: number;
  delta: number;
  targetPosition: AgentVec3 | null;
  hasAssignedTarget: boolean;
  lastKnownPosition: AgentVec3 | null;
  blockingObstacle: AgentObstacle | null;
  lineOfSightClear: boolean;
  weaponOrigin: AgentVec3;
  obstacles: readonly AgentObstacle[];
  canFire: boolean;
  leader: AgentLeader | null;
  isSquadLeader: boolean;
  formationOffset: readonly [number, number];
  home: AgentVec3;
  bound: number;
  threats: readonly AgentThreat[];
  retreatActive: boolean;
  routed: boolean;
  canFireWhileMoving: boolean;
  health: number;
  targetDistance: number;
  enemiesNearby: number;
  alliesNearby: number;
  leaderDistance: number;
  vehicle: AgentVehicle;
  weapon: AgentWeapon;
  squadOrder: AgentSquadOrder;
  damagedNeighborsCount: number;
  retreatingNeighborsCount: number;
  formationState: AgentFormationState;
  config: AgentConfig;
  ports: AgentPorts;
  decision: AgentDecision;
}
