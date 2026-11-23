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
