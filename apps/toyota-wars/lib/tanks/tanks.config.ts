export { AgentNodes as TankNodes } from "@toyota/agents";

export const TANK_CONFIG = {
  combat: {
    defaultShootInterval: 2.0,
    allyShootInterval: 0.5,
    enemyShootInterval: 0.5,
    allyDamageScale: 0.85,
    retreatSpreadMultiplier: 3.5,
    squadRoutLossFraction: 0.5,
    defaultMaxAngleOffsetRad: 0.25,
    fireRange: 60,
    fightingDistance: 55,
    retreatDistance: 45,
    retreatSafeDistance: 75,
    retreatMaxDuration: 12,
    playerAggroRadius: 38,
    playerAggroDamage: 30,
    lowHealthRetreatFraction: 0.35,
  },
  utility: {
    leaderLeashDistance: 20,
    momentumBonus: 0.15,
    minCommitMs: 600,
    debug: process.env.NODE_ENV !== "production",
  },
} as const;
