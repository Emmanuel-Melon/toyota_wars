import type { AgentConfig } from "@toyota/agents";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import { TANK_CONFIG } from "@/lib/tanks/tanks.config";

export const AGENT_CONFIG: AgentConfig = {
  fireRange: TANK_CONFIG.combat.fireRange,
  fightingDistance: TANK_CONFIG.combat.fightingDistance,
  defaultMaxAngleOffsetRad: TANK_CONFIG.combat.defaultMaxAngleOffsetRad,
  designatedFireRangeMultiplier: SQUAD_CONFIG.designatedFireRangeMultiplier,
  leaderLeashDistance: TANK_CONFIG.utility.leaderLeashDistance,
  momentumBonus: TANK_CONFIG.utility.momentumBonus,
  minCommitMs: TANK_CONFIG.utility.minCommitMs,
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
