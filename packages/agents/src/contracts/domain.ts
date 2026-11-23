import type { AgentVec2, AgentVec3 } from "./geometry";
import type { AgentIntentId } from "../intents/types";

export const AgentSquadDirective = {
  Advance: "advance",
  Hold: "hold",
  Flank: "flank",
  FightingRetreat: "fightingRetreat",
  GeneralRetreat: "generalRetreat",
} as const;

export type AgentSquadDirectiveType =
  (typeof AgentSquadDirective)[keyof typeof AgentSquadDirective];

export const AgentFireteamTactic = {
  HoldFormation: "holdFormation",
  SuppressAnvil: "suppressAnvil",
  FlankHook: "flankHook",
  CounterAmbush: "counterAmbush",
  BoundingRetreat: "boundingRetreat",
} as const;

export type AgentFireteamTacticType =
  (typeof AgentFireteamTactic)[keyof typeof AgentFireteamTactic];

export type AgentEnemyTacticalRole = "pin" | "flank" | "flankOrReposition";

export type AgentTacticalRole =
  | "vanguard"
  | "suppress"
  | "flank"
  | "support"
  | "artillery_support"
  | AgentEnemyTacticalRole;

export const AgentAttackMode = {
  Focus: "focus",
  Seek: "seek",
} as const;

export type AgentAttackModeType =
  (typeof AgentAttackMode)[keyof typeof AgentAttackMode];

export const AgentFireDesignationGroup = {
  Nearby: "nearby",
  Type63: "type63",
  Zu23: "zu23",
} as const;

export type AgentFireDesignationGroupType =
  (typeof AgentFireDesignationGroup)[keyof typeof AgentFireDesignationGroup];

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
