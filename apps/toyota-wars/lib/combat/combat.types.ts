// lib/combat/combat.types.ts
import type * as THREE from "three";
import type { VehiclePart } from "./combat.teams";
import type { WeaponId } from "@/lib/weapons/weapon.types";

export type Team = "ally" | "enemy";

export type HealthMap = Record<string, number>;

/** Per-part health, keyed by `partId(unitId, part)`. */
export type PartHealthMap = Record<string, number>;

export type TargetPart = {
  part: VehiclePart;
  offset: [number, number, number];
  radius: number;
  priority?: number;
};

export type EnemyTarget = {
  id: string;
  team: Team;
  position: [number, number, number];
  heading?: number;
  parts: TargetPart[];
};

export type PotentialTarget = {
  id: string;
  position: THREE.Vector3;
};

export type ProjectileExplosionEvent = {
  weapon: WeaponId;
  team: Team;
  position: THREE.Vector3;
};

export type TargetAllocationMap = Record<string, string>; // attackerId -> targetId

export type FireRequest = {
  startPos: THREE.Vector3;
  angle: number; // world-space yaw
  pitch?: number; // world-space elevation
  team: Team;
  weapon: WeaponId;
  spread?: number;
  damageScale?: number;
  worldMuzzle?: { position: THREE.Vector3; direction: THREE.Vector3 };
  source: "player" | "ai";
  barrel?: number;
};

export type ProjectileSystemHandle = {
  fire: (req: FireRequest) => void;
  clear: () => void;
};

export type Projectile = {
  active: boolean;
  weapon: WeaponId;
  team: Team;
  source: "player" | "ai"; // separate from collision team — fixes the player/ally conflation
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
};
