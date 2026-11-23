import * as THREE from "three";
import type {
  FleeConfig,
  Obstacle,
  TankThreat,
} from "@/lib/movement/movement.types";
import { distanceXZ } from "./movement.math";

function nearestThreat(
  position: Readonly<THREE.Vector3>,
  threats: readonly TankThreat[],
): TankThreat | null {
  let nearest: TankThreat | null = null;
  let nearestDistance = Infinity;
  for (const threat of threats) {
    const distance = distanceXZ(position, threat.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = threat;
    }
  }
  return nearest;
}

export function findCoverPoint(
  position: Readonly<THREE.Vector3>,
  threats: readonly TankThreat[],
  obstacles: readonly Obstacle[],
  bound: number,
  bodyRadius: number,
  config: FleeConfig,
): THREE.Vector3 | null {
  const threat = nearestThreat(position, threats);
  if (!threat) return null;

  let best: THREE.Vector3 | null = null;
  let bestTravel = Infinity;

  for (const obstacle of obstacles) {
    const radius = obstacle.radius ?? 0;
    if (radius <= bodyRadius) continue;
    if (
      distanceXZ(position, obstacle.position) >
      config.coverSearchRadius + radius
    ) {
      continue;
    }

    const awayX = obstacle.position.x - threat.position.x;
    const awayZ = obstacle.position.z - threat.position.z;
    const awayLength = Math.hypot(awayX, awayZ);
    if (awayLength < 1e-4) continue;

    const offset = radius + bodyRadius + config.coverClearance;
    const x = obstacle.position.x + (awayX / awayLength) * offset;
    const z = obstacle.position.z + (awayZ / awayLength) * offset;
    const margin = bound - bodyRadius;
    if (Math.abs(x) > margin || Math.abs(z) > margin) continue;

    const point = new THREE.Vector3(x, obstacle.position.y, z);
    if (
      distanceXZ(threat.position, point) <=
      distanceXZ(threat.position, position)
    ) {
      continue;
    }
    if (
      obstacles.some(
        (other) =>
          other !== obstacle &&
          distanceXZ(other.position, point) < (other.radius ?? 0) + bodyRadius,
      )
    ) {
      continue;
    }

    const travel = distanceXZ(position, point);
    if (travel >= bestTravel || travel > config.coverSearchRadius) continue;

    best = point;
    bestTravel = travel;
  }

  return best;
}
