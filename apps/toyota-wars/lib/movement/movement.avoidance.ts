import type * as THREE from "three";
import type { AvoidanceConfig, Obstacle } from "./movement.types";
import { closestObstacleSurface, type ObstacleSurface } from "@toyota/combat";

export function accumulateObstaclePush(
  out: THREE.Vector3,
  position: Readonly<THREE.Vector3>,
  obstacles: readonly Obstacle[],
  config: AvoidanceConfig,
): THREE.Vector3 {
  const seekX = out.x;
  const seekZ = out.z;
  const surface: ObstacleSurface = {
    x: 0,
    z: 0,
    normalX: 0,
    normalZ: 0,
    distance: 0,
  };

  for (const obstacle of obstacles) {
    closestObstacleSurface(obstacle, position.x, position.z, surface);
    const surfaceDistance = surface.distance;
    if (surfaceDistance >= config.padding) continue;

    const span = Math.max(1e-3, config.padding - config.bodyRadius);
    const strength =
      Math.min(1, (config.padding - surfaceDistance) / span) *
      config.pushMultiplier;
    const normalX = surface.normalX;
    const normalZ = surface.normalZ;
    out.x += normalX * strength;
    out.z += normalZ * strength;

    const ahead = -(seekX * normalX + seekZ * normalZ);
    if (ahead <= 0) continue;

    const cross = seekX * -normalZ - seekZ * -normalX;
    const side = cross >= 0 ? 1 : -1;
    const tangentStrength =
      strength * config.tangentMultiplier * Math.min(1, ahead);

    out.x += seekZ * side * tangentStrength;
    out.z += -seekX * side * tangentStrength;
  }
  return out;
}
