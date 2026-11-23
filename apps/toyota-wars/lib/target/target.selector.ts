import * as THREE from "three";
import type { EnemyTarget } from "../combat/combat.types";
import { isSmokeOccluded } from "../fx/fx.smoke";

export function selectBestTarget(
  vehiclePosition: THREE.Vector3,
  targets: readonly EnemyTarget[],
  designatedTargetId: string | null,
  maxRange: number,
): EnemyTarget | null {
  if (designatedTargetId) {
    const designated = targets.find((t) => t.id === designatedTargetId);
    if (
      designated &&
      isWithinRange(vehiclePosition, designated, maxRange) &&
      !isSmokeOccluded(vehiclePosition, targetCenter(designated))
    ) {
      return designated;
    }
  }

  let bestTarget: EnemyTarget | null = null;
  let bestScore = -Infinity;

  for (const target of targets) {
    if (!isWithinRange(vehiclePosition, target, maxRange)) continue;
    if (isSmokeOccluded(vehiclePosition, targetCenter(target))) continue;

    const distance = Math.hypot(
      target.position[0] - vehiclePosition.x,
      target.position[2] - vehiclePosition.z,
    );
    const threat = (target as { threatLevel?: number }).threatLevel ?? 1;
    const threatScore = threat * 1000 - distance;

    if (threatScore > bestScore) {
      bestScore = threatScore;
      bestTarget = target;
    }
  }

  return bestTarget;
}

function targetCenter(target: EnemyTarget): THREE.Vector3 {
  return new THREE.Vector3(
    target.position[0],
    target.position[1],
    target.position[2],
  );
}

function isWithinRange(
  pos: THREE.Vector3,
  target: EnemyTarget,
  range: number,
): boolean {
  const dx = target.position[0] - pos.x;
  const dz = target.position[2] - pos.z;
  return dx * dx + dz * dz <= range * range;
}
