// lib/tanks/tanks.config.ts

export const TankNodes = {
  CheckTargetAssigned: "check-target-assigned",
  CheckHasLeader: "check-has-leader",
  CheckTargetInRange: "check-target-in-range",
  CheckAligned: "check-aligned",
  Chase: "chase-with-avoidance",
  Shoot: "shoot-target",
  StandoffCombat: "standoff-combat",
  FormationFire: "formation-fire",
  Flank: "flank",
  LoSReposition: "los-reposition",
  PinCover: "pin-cover",
  Patrol: "patrol",
  Flee: "flee",
  CheckLeaderBeyond: "check-leader-beyond",
  CheckRetreating: "check-retreating",
  CheckRouted: "check-routed",
  AimAtTarget: "aim-at-target",
  FollowLeader: "follow-leader",
  Idle: "idle",
} as const;

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
    /** How far a follower may stray before rejoining formation. */
    leaderLeashDistance: 20,
    /** Score bonus that helps the current intent win re-evaluation. */
    momentumBonus: 0.15,
    /** Minimum time before switching away from a viable intent (ms). */
    minCommitMs: 600,
    /** Logs one score table per second in development. */
    debug: process.env.NODE_ENV !== "production",
  },
} as const;
