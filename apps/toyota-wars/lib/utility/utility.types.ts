import { AgentIntent } from "@toyota/agents";

export const TANK_INTENT = {
  ATTACK: AgentIntent.Attack,
  PIN: AgentIntent.Pin,
  RETREAT: AgentIntent.Retreat,
  FLANK: AgentIntent.Flank,
  LOS_REPOSITION: AgentIntent.LoSReposition,
  FOLLOW_LEADER: AgentIntent.FollowLeader,
  PATROL: AgentIntent.Patrol,
} as const;

export type TankIntent = (typeof TANK_INTENT)[keyof typeof TANK_INTENT];
export type { AgentUtilityOption as TankUtilityOption } from "@toyota/agents";
