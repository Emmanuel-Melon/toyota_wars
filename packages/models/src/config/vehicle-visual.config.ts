import type { V3 } from "../types";

export const HULL = {
  width: 2.6,
  height: 1.15,
  length: 4.2,
} as const;

export const WHEEL_VISUAL = {
  radius: 0.55,
  width: 0.45,
  trackHalfWidth: HULL.width / 2 + 0.45 / 2 - 0.1,
  axleY: -0.225,
  axles: [
    { z: 1.5, steers: true },
    { z: -1.5, steers: false },
  ],
} as const;

export const AXLE_Y = WHEEL_VISUAL.axleY;

export const GEOMETRY = {
  bevel: 0.03,
} as const;

export const PICKUP = {
  width: 1.85,
  baseY: AXLE_Y + 0.2,
  archR: WHEEL_VISUAL.radius + 0.14,
  frontZ: 2.65,
  rearZ: -2.65,
  cabRearZ: -0.9,
  bedFloorY: 0.5,
  bedSideH: 0.95,
  mountZ: -1.65,
} as const;

export const PICKUP_DERIVED = {
  archCy: AXLE_Y - PICKUP.baseY,
  frontAxleZ: WHEEL_VISUAL.axles[0].z,
  rearAxleZ: WHEEL_VISUAL.axles[1].z,
} as const;

export const CAB_PILLARS = {
  cowl: { z: 0.95, y: 0.86 },
  aPillarTop: { z: 0.38, y: 1.4 },
} as const;

const cowl = CAB_PILLARS.cowl;
const aPillar = CAB_PILLARS.aPillarTop;
const slope = Math.hypot(cowl.z - aPillar.z, cowl.y - aPillar.y);
const windshieldOffset = GEOMETRY.bevel + 0.015;

export const WINDSHIELD = {
  position: [
    0,
    (cowl.y + aPillar.y) / 2 +
      ((cowl.z - aPillar.z) / slope) * windshieldOffset,
    (cowl.z + aPillar.z) / 2 +
      ((aPillar.y - cowl.y) / slope) * windshieldOffset,
  ] as V3,
  rotationX: -Math.atan2(cowl.z - aPillar.z, aPillar.y - cowl.y),
  length: slope * 0.82,
} as const;

export const BEVEL = GEOMETRY.bevel;
export const ARCH_CY = PICKUP_DERIVED.archCy;
export const FRONT_AXLE_Z = PICKUP_DERIVED.frontAxleZ;
export const REAR_AXLE_Z = PICKUP_DERIVED.rearAxleZ;

export const MOUNT_MUZZLE_Z = {
  heavyMg: 1.85,
  autocannon: 1.95,
  rocketPod: 1.65,
} as const;

export const MOUNT_PITCH_OFFSET = {
  heavyMg: 0,
  autocannon: 0,
  rocketPod: -0.18,
} as const;

export const BARREL_KICK = 0.22;
