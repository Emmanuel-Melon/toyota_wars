import type { WeaponConfig } from "../weapon.types";

export const zu23Weapon: WeaponConfig = {
  id: "zu23",
  label: "ZU-23",
  mechanism: "projectile",
  directSuppression: 0.9,
  indirectFirepower: 0.1,
  preferredRange: 200,
  engagementRange: 60,
  aimTargetHeight: 1.25,
  cooldown: 0.15,
  spread: 0.015,
  recoil: 2.4,
  ammoCost: 1,
  muzzle: {
    height: 0.7,
    forwardOffset: 2.4,
  },
  muzzles: [{ right: -0.11 }, { right: 0.11 }],
  projectile: {
    speed: 600,
    life: 3,
    gravity: 9.81,
    drag: 0,
    hitRadius: 1.6,
    damage: 24,
  },
  audio: {
    kind: "sample",
    src: "/audio/zu23.mp3",
    fallback: "autocannon",
  },
  fx: {
    tracer: {
      every: 1,
      length: 10,
      width: 0.16,
      igniteDist: 12,
      burnTime: 4,
    },
    casing: {
      length: 0.115,
      radius: 0.0125,
      color: "#8b8f94",
      port: [0.15, 0.08, 1.4],
      eject: 3.5,
    },
    muzzleFlash: {
      size: 0.7,
      duration: 0.08,
      color: "#ffe08a",
    },
    explosion: null,
  },
  visual: {
    mount: "autocannon",
    projectile: { size: 0.16, color: "#ffd27a", emissive: "#ff7a1a" },
  },
};
