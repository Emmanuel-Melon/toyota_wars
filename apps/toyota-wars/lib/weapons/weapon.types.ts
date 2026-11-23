// lib/weapons/weapon.types.ts
import type * as THREE from "three";

export type WeaponId = "dshk" | "zu23" | "type63";

export type WeaponMechanism = "projectile" | "rocket";

export type WeaponAudioSpec =
  { kind: "heavyMg" } | { kind: "autocannon" } | { kind: "rocket" };

export type WeaponProjectileVisual = {
  size: number;
  color: string;
  emissive?: string;
};

export type MuzzleFlashSpec = {
  size: number;
  duration: number;
  color: string;
};

export type WeaponMountKind = "heavyMg" | "autocannon" | "rocketPod";

/** Emitter offset relative to the centreline muzzle. */
export type WeaponMuzzleEmitter = {
  right: number;
  up?: number;
};

export type TracerSpec = {
  every: number;
  length: number;
  width: number;
  igniteDist: number;
  burnTime: number;
  color?: string;
};

export type CasingSpec = {
  length: number;
  radius: number;
  color: string;
  port: [side: number, up: number, back: number];
  eject: number;
};

export type ExplosionFxSpec = {
  scale: number;
  color: string;
  fireDuration: number;
  smoke: { lifetime: number; radius: number; height: number } | null;
};

export type WeaponFx = {
  tracer: TracerSpec | null;
  casing: CasingSpec | null;
  muzzleFlash: MuzzleFlashSpec | null;
  explosion: ExplosionFxSpec | null;
};

export type WeaponVisualSpec = {
  projectile: WeaponProjectileVisual;
  mount: WeaponMountKind;
};

export type WeaponExplosionSpec = {
  radius: number;
  triggerRadius: number;
  damage: number;
  minDamageRatio: number;
  friendlyFire: boolean;
};

export type WeaponConfig = {
  id: WeaponId;
  label: string;
  mechanism: WeaponMechanism;
  /** 0..1: Direct-fire pinning power. */
  directSuppression: number;
  /** 0..1: Long-range indirect/area bombardment. */
  indirectFirepower: number;
  /** Optimal engagement range in meters for tactical positioning. */
  preferredRange: number;
  /** Maximum distance at which the weapon will actually fire. */
  engagementRange: number;
  aimTargetHeight: number;
  cooldown: number;
  spread: number;
  recoil: number;
  ammoCost: number;
  muzzle: { height: number; forwardOffset: number };
  /** Emitter offsets from the centreline; omit for a single barrel. */
  muzzles?: readonly WeaponMuzzleEmitter[];
  projectile: {
    speed: number;
    life: number;
    gravity: number;
    drag: number;
    hitRadius: number;
    damage: number;
  };
  audio: WeaponAudioSpec;
  visual: WeaponVisualSpec;
  fx: WeaponFx;
  explosion?: WeaponExplosionSpec;
};

export type WeaponState = {
  readonly position: THREE.Vector3;
  readonly heading: number;
};

export type WeaponTimer = {
  readonly ready: boolean;
  tick(dt: number): void;
  tryFire(): boolean;
};

export type WeaponOrder =
  | { type: "hold" }
  | {
      type: "fireAt";
      point: Readonly<THREE.Vector3>;
      requireAlignment?: boolean;
    };
