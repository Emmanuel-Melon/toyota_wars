import type { AgentConfig } from "@toyota/agents";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import { WEAPONS } from "@toyota/combat";

export const AGENT_UTILITY_DEBUG = process.env.NODE_ENV !== "production";

const MAX_ENGAGEMENT_RANGE = Math.max(
  1000,
  ...Object.values(WEAPONS).map((weapon) => weapon.engagementRange),
);

export const AGENT_CONFIG: AgentConfig = {
  fireRange: MAX_ENGAGEMENT_RANGE,
  fightingDistance: MAX_ENGAGEMENT_RANGE * 0.9,
  defaultMaxAngleOffsetRad: 0.25,
  designatedFireRangeMultiplier: SQUAD_CONFIG.designatedFireRangeMultiplier,
  leaderLeashDistance: 20,
  momentumBonus: 0.15,
  minCommitMs: 600,
  repositionClearance: MOVEMENT_CONFIG.reposition.clearance,
  repositionSampleCount: MOVEMENT_CONFIG.reposition.sampleCount,
  chaseSpeed: MOVEMENT_CONFIG.throttle.chase,
  fleeSpeed: MOVEMENT_CONFIG.throttle.flee,
  patrolSpeed: MOVEMENT_CONFIG.throttle.patrol,
  chaseStandoffDistance: MOVEMENT_CONFIG.chase.standoffDistance,
  stopDistance: MOVEMENT_CONFIG.stopDistance,
  repositionStopDistance: MOVEMENT_CONFIG.reposition.stopDistance,
  followArriveRadius: MOVEMENT_CONFIG.follow.arriveRadius,
  followSlowRadius: MOVEMENT_CONFIG.follow.slowRadius,
  patrolRadius: MOVEMENT_CONFIG.patrol.radius,
  patrolArriveRadius: MOVEMENT_CONFIG.patrol.arriveRadius,
  patrolGiveUpAfter: MOVEMENT_CONFIG.patrol.giveUpAfter,
  patrolPause: MOVEMENT_CONFIG.patrol.pause,
  bodyRadius: MOVEMENT_CONFIG.body.radius,
};

export const TANK_CONFIG = {
  combat: {
    allyDamageScale: 0.85,
    retreatSpreadMultiplier: 3.5,
    squadRoutLossFraction: 0.5,
    retreatSafeDistance: MAX_ENGAGEMENT_RANGE * 1.1,
    retreatMaxDuration: 12,
    playerAggroRadius: MAX_ENGAGEMENT_RANGE,
    playerAggroDamage: 30,
    lowHealthRetreatFraction: 0.35,
  },
} as const;
