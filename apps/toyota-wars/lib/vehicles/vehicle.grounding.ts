import type { TerrainSampler } from "@/lib/map/map.terrain";
import * as THREE from "three";

const HALF_L = 1.4,
  HALF_W = 0.9;

export interface ChassisPose {
  pitch: number;
  roll: number;
}

export interface ChassisTerrain {
  y: number;
  front: number;
  back: number;
  right: number;
  left: number;
}

export function sampleChassisTerrain(
  x: number,
  z: number,
  heading: number,
  terrain: TerrainSampler,
): ChassisTerrain {
  const fx = Math.sin(heading),
    fz = Math.cos(heading);
  const rx = Math.cos(heading),
    rz = -Math.sin(heading);

  const front = terrain.getHeight(x + fx * HALF_L, z + fz * HALF_L);
  const back = terrain.getHeight(x - fx * HALF_L, z - fz * HALF_L);
  const right = terrain.getHeight(x + rx * HALF_W, z + rz * HALF_W);
  const left = terrain.getHeight(x - rx * HALF_W, z - rz * HALF_W);

  return {
    y: (front + back + right + left) / 4,
    front,
    back,
    right,
    left,
  };
}

export function updateChassisPose(
  pose: ChassisPose,
  terrain: ChassisTerrain,
  dt: number,
) {
  pose.pitch = THREE.MathUtils.damp(
    pose.pitch,
    -Math.atan2(terrain.front - terrain.back, 2 * HALF_L),
    10,
    dt,
  );
  pose.roll = THREE.MathUtils.damp(
    pose.roll,
    Math.atan2(terrain.right - terrain.left, 2 * HALF_W),
    10,
    dt,
  );
}

export function groundVehicle(
  group: THREE.Group,
  pos: Readonly<THREE.Vector3>,
  heading: number,
  pose: ChassisPose,
  dt: number,
  terrainSampler: TerrainSampler,
) {
  const terrain = sampleChassisTerrain(pos.x, pos.z, heading, terrainSampler);

  updateChassisPose(pose, terrain, dt);

  group.position.set(pos.x, pos.y, pos.z);
  group.rotation.set(pose.pitch, heading, pose.roll, "YXZ");
}
