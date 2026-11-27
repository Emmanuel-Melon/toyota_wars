import * as THREE from "three";
import {
  COMBAT_CONFIG,
  type HealthMap,
  type PotentialTarget,
  type Team,
} from "@toyota/combat";
import type { Vec2 } from "@toyota/missions";
import type { UnitRegistry } from "./squad.registry";
import { MESO_CONFIG } from "@toyota/ai";
import { TANK_CONFIG } from "../agents/agent-runtime.config";

export type SquadSituational = {
  squadCenter: Vec2;
  liveUnits: number;
  localAllies: number;
  localEnemies: number;
  strengthRatio: number;
  effectiveStrengthRatio: number;
  retreatAllowed: boolean;
  nearestThreatDist: number;
  threatPoint: Vec2 | null;
  priorityMemberIds: ReadonlySet<string>;
  retreatMemberIds: ReadonlySet<string>;
};

export type SituationalInput = {
  team: Team;
  opposing: Team;
  units: readonly { id: string; maxHealth: number }[];
  health: HealthMap;
  registry: UnitRegistry;
  enemyTargets: readonly PotentialTarget[];
  rallyPoint: THREE.Vector3;
  getPlayerAggro: (id: string) => number;
};

/**
 * Computes ALL local-awareness data for a squad tick. Extracted from the
 * render component so it can be unit-tested and reused by any consumer.
 */
export function computeSquadSituational(
  input: SituationalInput,
): SquadSituational {
  const {
    team,
    opposing,
    units,
    health,
    registry,
    enemyTargets,
    rallyPoint,
    getPlayerAggro,
  } = input;

  // ── Squad center + live count ────────────────────────────────────────
  let cx = 0;
  let cz = 0;
  let liveUnits = 0;
  for (const unit of units) {
    if ((health[unit.id] ?? unit.maxHealth) <= 0) continue;
    const p = registry.get(unit.id)?.position;
    if (!p) continue;
    cx += p.x;
    cz += p.z;
    liveUnits += 1;
  }
  const squadCenter: Vec2 =
    liveUnits > 0
      ? { x: cx / liveUnits, z: cz / liveUnits }
      : { x: rallyPoint.x, z: rallyPoint.z };

  // ── Awareness radius counts ─────────────────────────────────────────
  const rSq = MESO_CONFIG.localAwarenessRadius ** 2;
  let localAllies = 0;
  for (const u of registry.aiByTeam(team)) {
    const dx = u.position.x - squadCenter.x;
    const dz = u.position.z - squadCenter.z;
    if (dx * dx + dz * dz <= rSq) localAllies += 1;
  }
  let localEnemies = 0;
  for (const u of registry.byTeam(opposing)) {
    const dx = u.position.x - squadCenter.x;
    const dz = u.position.z - squadCenter.z;
    if (dx * dx + dz * dz <= rSq) localEnemies += 1;
  }
  const strengthRatio = localAllies / Math.max(1, localEnemies);

  let localAllyStrength = 0;
  for (const u of registry.byTeam(team)) {
    const rawHealth = health[u.id] ?? COMBAT_CONFIG.MAX_HEALTH;
    if (rawHealth <= 0) continue;
    const dx = u.position.x - squadCenter.x;
    const dz = u.position.z - squadCenter.z;
    if (dx * dx + dz * dz <= rSq) {
      localAllyStrength += Math.min(1, rawHealth / COMBAT_CONFIG.MAX_HEALTH);
    }
  }

  let localEnemyStrength = 0;
  for (const u of registry.byTeam(opposing)) {
    const rawHealth = health[u.id] ?? COMBAT_CONFIG.MAX_HEALTH;
    if (rawHealth <= 0) continue;
    const dx = u.position.x - squadCenter.x;
    const dz = u.position.z - squadCenter.z;
    if (dx * dx + dz * dz <= rSq) {
      localEnemyStrength += Math.min(1, rawHealth / COMBAT_CONFIG.MAX_HEALTH);
    }
  }

  const effectiveStrengthRatio =
    localEnemyStrength > 0 ? localAllyStrength / localEnemyStrength : Infinity;
  const retreatAllowed = team !== "enemy" || effectiveStrengthRatio < 1;

  // ── Nearest threat ──────────────────────────────────────────────────
  let nearestThreatDist = Infinity;
  let threatPoint: Vec2 | null = null;
  for (const t of enemyTargets) {
    const d = Math.hypot(
      t.position.x - squadCenter.x,
      t.position.z - squadCenter.z,
    );
    if (d < nearestThreatDist) {
      nearestThreatDist = d;
      threatPoint = { x: t.position.x, z: t.position.z };
    }
  }

  // ── Per-unit priority / retreat classification ──────────────────────
  const playerTarget =
    team === "enemy"
      ? enemyTargets.find((t) => t.id === COMBAT_CONFIG.PLAYER_ID)
      : undefined;

  const priorityMemberIds = new Set<string>();
  const retreatMemberIds = new Set<string>();

  for (const unit of units) {
    if ((health[unit.id] ?? unit.maxHealth) <= 0) continue;
    const pos = registry.get(unit.id)?.position;
    if (!pos) continue;

    let nearest = Infinity;
    for (const t of enemyTargets) {
      const d = pos.distanceTo(t.position);
      if (d < nearest) nearest = d;
    }
    if (
      (health[unit.id] ?? unit.maxHealth) / unit.maxHealth <=
        TANK_CONFIG.combat.lowHealthRetreatFraction &&
      nearest <= TANK_CONFIG.combat.retreatSafeDistance
    ) {
      retreatMemberIds.add(unit.id);
    }

    if (playerTarget) {
      const distToPlayer = pos.distanceTo(playerTarget.position);
      if (
        distToPlayer <= TANK_CONFIG.combat.playerAggroRadius ||
        getPlayerAggro(unit.id) >= TANK_CONFIG.combat.playerAggroDamage
      ) {
        priorityMemberIds.add(unit.id);
      }
    }
  }

  return {
    squadCenter,
    liveUnits,
    localAllies,
    localEnemies,
    strengthRatio,
    effectiveStrengthRatio,
    retreatAllowed,
    nearestThreatDist,
    threatPoint,
    priorityMemberIds,
    retreatMemberIds,
  };
}
