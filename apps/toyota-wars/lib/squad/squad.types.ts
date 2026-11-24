// apps/toyota-wars/lib/squad/squad.types.ts
import type { FormationType } from "@/lib/tactics/tactics.formation";
import type { FireteamTactic } from "../meso/meso.types";
import type { VehiclePlatform } from "../vehicles/vehicle.types";
import type { WeaponConfig } from "../weapons/weapon.types";
import type { AgentIntentId } from "@toyota/agents";

export interface Point2D {
  x: number;
  y: number;
}

export const SQUAD_DIRECTIVE = {
  ADVANCE: "advance",
  HOLD: "hold",
  FLANK: "flank",
  FIGHTING_RETREAT: "fightingRetreat",
  GENERAL_RETREAT: "generalRetreat",
} as const;

export type SquadDirective =
  (typeof SQUAD_DIRECTIVE)[keyof typeof SQUAD_DIRECTIVE];

export const ENEMY_TACTICAL_ROLE = {
  PIN: "pin",
  FLANK: "flank",
  FLANK_OR_REPOSITION: "flankOrReposition",
} as const;

export type EnemyTacticalRole =
  (typeof ENEMY_TACTICAL_ROLE)[keyof typeof ENEMY_TACTICAL_ROLE];

export const ENEMY_TACTICAL_ROLES: readonly EnemyTacticalRole[] =
  Object.values(ENEMY_TACTICAL_ROLE);

export type TacticalRole =
  | "vanguard"
  | "suppress"
  | "flank"
  | "support"
  | "artillery_support"
  | EnemyTacticalRole;

export const FIRE_DESIGNATION_GROUP = {
  NEARBY: "nearby",
  TYPE63: "type63",
  ZU23: "zu23",
} as const;

export type FireDesignationGroup =
  (typeof FIRE_DESIGNATION_GROUP)[keyof typeof FIRE_DESIGNATION_GROUP];

export const ALLY_ATTACK_MODE = {
  FOCUS: "focus",
  SEEK: "seek",
} as const;

export type AllyAttackMode =
  (typeof ALLY_ATTACK_MODE)[keyof typeof ALLY_ATTACK_MODE];

export type AllyAttackOrder = {
  mode: AllyAttackMode;
  targetId?: string;
  issuedAt: number;
};

export type FireDesignation = {
  id: number;
  point: { x: number; z: number };
  targetId?: string;
  group: FireDesignationGroup;
  expiresAt: number;
};

export type EnemyTacticalAssignment = {
  role: EnemyTacticalRole;
  coverObstacleId?: string;
  flankSide?: -1 | 1;
  flankVector?: Point2D;
  flankPoint?: Point2D;
  pinPoint?: Point2D;
};

export interface SquadOrderContext {
  directive: SquadDirective;
  fireteamTactic: FireteamTactic;
  assignedRole: TacticalRole;
  tactical?: EnemyTacticalAssignment | null;
  formationType: FormationType;
  formationOffset: [number, number];
  subGroupLeaderId: string | null;
  useOrbitTactic: boolean;
  targetPosition: Point2D | null;
  targetStopDistance?: number;
  targetIsObjective?: boolean;
  rallyPoint: Point2D;
  isExplicitOrder: boolean;
  forcedIntent?: AgentIntentId;
  fireDesignation?: FireDesignation | null;
  attackOrder?: AllyAttackOrder | null;
  retreatingRatio: number;
  retreatAllowed: boolean;
}

export interface SquadMemberTelemetry {
  id: string;
  health: number; // 0 to 1
  vehicle: VehiclePlatform;
  weapon: WeaponConfig;
  isRetreating: boolean;
  position: Point2D;
}
