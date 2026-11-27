// apps/toyota-wars/lib/squad/squad.config.ts
import { WEAPONS } from "@toyota/combat";

const MAX_ENGAGEMENT_RANGE = Math.max(
  1000,
  ...Object.values(WEAPONS).map((weapon) => weapon.engagementRange),
);

export const SQUAD_CONFIG = {
  /** If this ratio (0 to 1) of squad members are retreating, the entire squad falls back. */
  generalRetreatThreshold: 0.4,
  /** Average squad health below which defensive/retreat weighting escalates. */
  criticalSquadHealthThreshold: 0.3,
  /** Leash distance before units are considered strayed from the squad rally point. */
  defaultLeashDistance: 250,
  designateNearbyRadius: MAX_ENGAGEMENT_RANGE,
  designateVehicleSnapRadius: 7,
  designateDurationMs: 8000,
  designatedFireRangeMultiplier: 3,
  enemyTactics: {
    intervalMs: 400,
    groupRadius: 65,
    splitThreshold: 3,
    coverSearchRadius: 55,
    clearance: 3,
    sampleCount: 16,
  },
} as const;
