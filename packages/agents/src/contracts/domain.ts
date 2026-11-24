import type { AgentVec2, AgentVec3 } from "./geometry";
import type { AgentIntentId } from "../intents/types";
import {
  AgentAttackModeType,
  AgentFireDesignationGroupType,
  AgentSquadDirectiveType,
  AgentFireteamTacticType,
  AgentTacticalRole,
} from "../agents.config";

export type AgentEnemyTacticalRole = "pin" | "flank" | "flankOrReposition";

export interface AgentPointXZ {
  readonly x: number;
  readonly z: number;
}

export interface AgentTacticalAssignment {
  role: AgentEnemyTacticalRole;
  coverObstacleId?: string;
  flankSide?: -1 | 1;
  flankVector?: AgentVec2;
  flankPoint?: AgentVec2;
  pinPoint?: AgentVec2;
}

export interface AgentAttackOrder {
  mode: AgentAttackModeType;
  targetId?: string;
  issuedAt: number;
}

export interface AgentFireDesignation {
  id: number;
  point: AgentPointXZ;
  targetId?: string;
  group: AgentFireDesignationGroupType;
  expiresAt: number;
}

export interface AgentSquadOrder {
  directive: AgentSquadDirectiveType;
  fireteamTactic: AgentFireteamTacticType;
  assignedRole: AgentTacticalRole;
  tactical?: AgentTacticalAssignment | null;
  formationOffset: readonly [number, number];
  targetPosition: AgentVec2 | null;
  targetStopDistance?: number;
  targetIsObjective?: boolean;
  rallyPoint: AgentVec2;
  forcedIntent?: AgentIntentId;
  fireDesignation?: AgentFireDesignation | null;
  attackOrder?: AgentAttackOrder | null;
  retreatAllowed: boolean;
}

export interface AgentVehicle {
  frontlineDurability: number;
}

export interface AgentWeapon {
  directSuppression: number;
  preferredRange: number;
  engagementRange: number;
}

export interface AgentObstacle {
  readonly position: AgentVec3;
  readonly radius?: number;
  readonly destructible?: boolean;
  readonly shape?: "box";
  readonly halfWidth?: number;
  readonly halfDepth?: number;
  readonly yaw?: number;
  readonly height?: number;
  readonly structure?: "building" | "watchtower";
  readonly locationId?: string;
}
