import type { WeaponMountKind } from "@/lib/weapons/weapon.types";

export const BARREL_KICK = 0.22;

export const MOUNT_MUZZLE_Z: Record<WeaponMountKind, number> = {
  heavyMg: 1.85,
  autocannon: 1.95,
  rocketPod: 1.65,
};

export const MOUNT_PITCH_OFFSET: Record<WeaponMountKind, number> = {
  heavyMg: 0,
  autocannon: 0,
  rocketPod: -0.18,
};
