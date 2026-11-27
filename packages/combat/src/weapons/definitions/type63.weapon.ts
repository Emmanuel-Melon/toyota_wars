import type { WeaponConfig } from "../weapon.types";

export const type63Weapon: WeaponConfig = {
  id: "type63",
  label: "Type 63",
  mechanism: "rocket",
  directSuppression: 0.2,
  indirectFirepower: 0.95,
  preferredRange: 2200,
  engagementRange: 2000,
  aimTargetHeight: 1.25,
  cooldown: 2.5,
  spread: 0.002,
  recoil: 5,
  ammoCost: 1,
  muzzle: {
    height: 1.0,
    forwardOffset: 2.8,
  },
  projectile: {
    speed: 700,
    life: 3.6,
    gravity: 4.5,
    drag: 0.01,
    hitRadius: 3.0,
    damage: 45,
  },
  audio: { kind: "rocket" },
  fx: {
    tracer: {
      every: 1,
      length: 9,
      width: 0.35,
      igniteDist: 0,
      burnTime: 6,
      color: "#ffb347",
    },
    casing: null,
    muzzleFlash: {
      size: 1.1,
      duration: 0.18,
      color: "#ff5a1f",
    },
    explosion: {
      scale: 0.75,
      color: "#ff7a1a",
      fireDuration: 0.55,
      smoke: {
        lifetime: 5,
        radius: 4.05,
        height: 6.3,
      },
    },
  },
  visual: {
    mount: "rocketPod",
    projectile: { size: 0.3, color: "#ff8a3d", emissive: "#ff3b00" },
  },
  explosion: {
    radius: 9,
    triggerRadius: 7,
    damage: 45,
    minDamageRatio: 0.35,
    friendlyFire: false,
  },
};
