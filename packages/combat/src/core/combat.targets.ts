// lib/combat/combat.targets.ts
import { COMBAT_CONFIG } from "./combat.config";
import type {
  HealthMap,
  PotentialTarget,
  TargetAllocationMap,
} from "./combat.types";
import * as THREE from "three";
import {
  distance3D,
  isTargetVisible,
  readTargetPosition,
} from "../target/target.shared";

export const NO_TARGET_Z = 9999;

const targetCenter = new THREE.Vector3();

export function hasAssignedTarget(
  target: Readonly<THREE.Vector3> | null,
): target is Readonly<THREE.Vector3> {
  return target !== null && Math.abs(target.z) < NO_TARGET_Z;
}

export function selectSquadTarget(
  attackerId: string,
  attackerPos: THREE.Vector3,
  validTargets: PotentialTarget[],
  healthMap: HealthMap,
  allocations: TargetAllocationMap,
): PotentialTarget | null {
  if (validTargets.length === 0) return null;

  let bestTarget: PotentialTarget | null = null;
  let highestScore = -Infinity;

  for (const target of validTargets) {
    const currentHealth = healthMap[target.id] ?? COMBAT_CONFIG.MAX_HEALTH;
    if (currentHealth <= 0) continue;

    readTargetPosition(target.position, targetCenter);
    if (!isTargetVisible(attackerPos, targetCenter)) continue;

    // 1. Distance Score (0 to 1): Closer targets score higher
    const dist = distance3D(attackerPos, targetCenter);
    if (dist > COMBAT_CONFIG.MAX_TARGET_RANGE) continue;
    const normalizedDistance = dist / COMBAT_CONFIG.MAX_TARGET_RANGE;
    const distanceScore = 1 / (1 + 1.5 * normalizedDistance * normalizedDistance);

    // 2. Health Score (0 to 1): Low-health targets score higher to secure kills
    const healthPercent = currentHealth / COMBAT_CONFIG.MAX_HEALTH;
    const lowHealthBonus = 1 - healthPercent;

    // 3. Overcrowding Penalty: Count how many allies are ALREADY targeting this unit
    let targetedByCount = 0;
    for (const [otherAttackerId, assignedTargetId] of Object.entries(
      allocations,
    )) {
      if (otherAttackerId !== attackerId && assignedTargetId === target.id) {
        targetedByCount++;
      }
    }
    const crowdPenalty = targetedByCount * 0.35; // Penalty factor for multiple units on 1 target

    // Final Utility Weighting
    const totalScore =
      distanceScore * 0.45 + lowHealthBonus * 0.35 - crowdPenalty;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestTarget = target;
    }
  }

  return bestTarget;
}
