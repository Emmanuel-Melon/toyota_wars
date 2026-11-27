// lib/weapons/weapon.math.ts
import * as THREE from "three";
import type { FireRequest } from "../combat/combat.types";
import type { WeaponConfig, WeaponId } from "./weapon.types";

export function weaponDirection(
  angle: number,
  pitch: number,
  out: THREE.Vector3,
): THREE.Vector3 {
  const horizontal = Math.cos(pitch);
  return out.set(
    Math.sin(angle) * horizontal,
    Math.sin(pitch),
    Math.cos(angle) * horizontal,
  );
}

export function applyMuzzleOffset(
  startPos: Readonly<THREE.Vector3>,
  direction: Readonly<THREE.Vector3>,
  config: WeaponConfig,
  out: THREE.Vector3,
): THREE.Vector3 {
  out.copy(startPos);
  out.y += config.muzzle.height;
  return out.addScaledVector(direction, config.muzzle.forwardOffset);
}

export function createFireRequest(
  startPos: Readonly<THREE.Vector3>,
  angle: number,
  team: FireRequest["team"],
  weapon: WeaponId,
  spread?: number,
  pitch?: number,
  damageScale?: number,
  worldMuzzle?: FireRequest["worldMuzzle"],
  source: FireRequest["source"] = "ai",
  barrel?: number,
): FireRequest {
  return {
    startPos: startPos.clone(),
    angle,
    pitch,
    team,
    weapon,
    spread,
    damageScale,
    worldMuzzle,
    source,
    barrel,
  };
}
