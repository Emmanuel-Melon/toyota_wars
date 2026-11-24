// packages/agents/src/agents.config.ts
import { AgentEnemyTacticalRole } from "./contracts/domain";

/**
 * ============================================================================
 * 1. Low-Level Execution Orders
 * ============================================================================
 * Atomic, direct instructions given to an individual agent's locomotion and
 * weapons systems. Movement orders control positioning and orientation, while
 * weapon orders govern immediate engagement rules.
 */
export const AgentMovementOrders = {
  Idle: "idle",
  Face: "face",
  MoveTo: "moveTo",
  Follow: "follow",
  Flee: "flee",
} as const;

export type AgentMovementOrderType =
  (typeof AgentMovementOrders)[keyof typeof AgentMovementOrders];

export const AgentWeaponOrders = {
  Hold: "hold",
  FireAt: "fireAt",
} as const;

export type AgentWeaponOrderType =
  (typeof AgentWeaponOrders)[keyof typeof AgentWeaponOrders];

/**
 * ============================================================================
 * 2. Group Tactics & Command Directives
 * ============================================================================
 * Higher-level maneuvers and coordination patterns applied across squads or
 * fireteams. Squad directives set broad operational intent, whereas fireteam
 * tactics define specific coordinated combat maneuvers.
 */
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

/**
 * ============================================================================
 * 3. Agent Roles & Target Selection
 * ============================================================================
 * Definitions covering an agent's functional role within a force (including
 * imported enemy tactical roles), target-selection behavior, and designated
 * target/threat categories.
 */
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
