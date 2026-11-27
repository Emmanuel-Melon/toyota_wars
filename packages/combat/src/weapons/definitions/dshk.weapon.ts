import type { WeaponConfig } from "../weapon.types";

export const dshkWeapon: WeaponConfig = {
  id: "dshk",
  label: "DShK",
  mechanism: "projectile",
  directSuppression: 0.5,
  indirectFirepower: 0,
  preferredRange: 1200,
  engagementRange: 1000,
  aimTargetHeight: 1.25,
  cooldown: 0.25,
  spread: 0.003,
  recoil: 1,
  ammoCost: 1,
  muzzle: {
    height: 0.5,
    forwardOffset: 2.0,
  },
  projectile: {
    speed: 800,
    life: 2.7,
    gravity: 9.81,
    drag: 0,
    hitRadius: 1.6,
    damage: 18,
  },
  audio: {
    kind: "sample",
    src: "/audio/dshk.mp3",
    fallback: "heavyMg",
  },
  fx: {
    tracer: { every: 3, length: 7, width: 0.1, igniteDist: 10, burnTime: 3 },
    casing: {
      length: 0.06,
      radius: 0.007,
      color: "#c8a24a",
      port: [0.12, 0.05, 1.3],
      eject: 3,
    },
    muzzleFlash: {
      size: 0.5,
      duration: 0.06,
      color: "#ffb347",
    },
    explosion: null,
  },
  visual: {
    mount: "heavyMg",
    projectile: { size: 0.12, color: "#ffd27a", emissive: "#ff7a1a" },
  },
};
