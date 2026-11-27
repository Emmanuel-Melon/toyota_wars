import * as THREE from "three";
import type { EnemyTarget } from "../core/combat.types";
import {
  distanceXZ,
  isTargetVisible,
  isWithinXZRange,
  readTargetPosition,
} from "./target.shared";

const targetCenter = new THREE.Vector3();

export function selectAimTarget(
  vehiclePosition: THREE.Vector3,
  targets: readonly EnemyTarget[],
  designatedTargetId: string | null,
  maxRange: number,
): EnemyTarget | null {
  if (designatedTargetId) {
    const designated = targets.find((t) => t.id === designatedTargetId);
    if (designated) {
      readTargetPosition(designated.position, targetCenter);
      if (
        isWithinXZRange(vehiclePosition, targetCenter, maxRange) &&
        isTargetVisible(vehiclePosition, targetCenter)
      ) {
        return designated;
      }
    }
  }

  let bestTarget: EnemyTarget | null = null;
  let bestScore = -Infinity;

  for (const target of targets) {
    readTargetPosition(target.position, targetCenter);
    if (!isWithinXZRange(vehiclePosition, targetCenter, maxRange)) continue;
    if (!isTargetVisible(vehiclePosition, targetCenter)) continue;

    const distance = distanceXZ(vehiclePosition, targetCenter);
    const threat = (target as { threatLevel?: number }).threatLevel ?? 1;
    const threatScore = threat * 1000 - distance;

    if (threatScore > bestScore) {
      bestScore = threatScore;
      bestTarget = target;
    }
  }

  return bestTarget;
}
