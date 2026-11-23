// lib/movement/movement.flee.ts
import * as THREE from "three";
import type { FleeConfig, TankThreat } from "@/lib/movement/movement.types";
import { TAU, distanceXZ, headingToVector } from "./movement.math";

const _current = new THREE.Vector3();
const _candidate = new THREE.Vector3();
const _probe = { x: 0, z: 0 };

function boundaryDistance(
  position: Readonly<THREE.Vector3>,
  dirX: number,
  dirZ: number,
  bound: number,
): number {
  let distance = Infinity;

  if (dirX > 1e-6) {
    distance = Math.min(distance, (bound - position.x) / dirX);
  } else if (dirX < -1e-6) {
    distance = Math.min(distance, (-bound - position.x) / dirX);
  }

  if (dirZ > 1e-6) {
    distance = Math.min(distance, (bound - position.z) / dirZ);
  } else if (dirZ < -1e-6) {
    distance = Math.min(distance, (-bound - position.z) / dirZ);
  }

  return Math.max(0, distance);
}

/** Pick the open direction that keeps the furthest away from every threat. */
export function chooseFleeHeading(
  position: Readonly<THREE.Vector3>,
  threats: readonly TankThreat[],
  currentHeading: number,
  bound: number,
  config: FleeConfig,
): number | null {
  if (threats.length === 0) return null;

  const current = headingToVector(currentHeading, _current);

  let bestHeading: number | null = null;
  let bestScore = -Infinity;

  for (let index = 0; index < config.candidateCount; index += 1) {
    const heading = (index / config.candidateCount) * TAU;
    const dir = headingToVector(heading, _candidate);
    const edgeDistance = boundaryDistance(position, dir.x, dir.z, bound);
    const lookAhead = Math.min(config.lookAhead, edgeDistance);
    _probe.x = position.x + dir.x * lookAhead;
    _probe.z = position.z + dir.z * lookAhead;

    let nearestThreat = Infinity;
    for (const threat of threats) {
      nearestThreat = Math.min(
        nearestThreat,
        distanceXZ(threat.position, _probe),
      );
    }

    const continuity = dir.x * current.x + dir.z * current.z;
    const score =
      nearestThreat +
      config.boundaryWeight * edgeDistance +
      config.headingBias * continuity;

    if (score > bestScore) {
      bestScore = score;
      bestHeading = heading;
    }
  }

  return bestHeading;
}
