import * as THREE from "three";
import { resolveCameraAim } from "./aim.camera";
import { fallbackAimTarget } from "./aim.math";
import type { AimState, AimingMode } from "./aim.types";
import { selectAimTarget } from "../target/target.selector";
import { COMBAT_CONFIG } from "../core/combat.config";
import type { EnemyTarget } from "../core/combat.types";
import type { WeaponConfig } from "../weapons/weapon.types";
import type { DefaultWeaponExecutor } from "../weapons/weapon.executor";

const clampedTarget = new THREE.Vector3();

function clampToRange(
  origin: Readonly<THREE.Vector3>,
  target: THREE.Vector3,
  range: number,
): THREE.Vector3 {
  if (!Number.isFinite(range) || range <= 0) return target;
  clampedTarget.subVectors(target, origin);
  const distance = clampedTarget.length();
  if (distance <= range || distance <= 1e-6) return target;
  return target.copy(origin).addScaledVector(clampedTarget, range / distance);
}

export class AimController {
  private mode: AimingMode = "auto";
  private resolvedTargetId: string | null = null;

  constructor(initialMode: AimingMode = "auto") {
    this.mode = initialMode;
  }

  public setMode(mode: AimingMode): void {
    this.mode = mode;
  }

  public getMode(): AimingMode {
    return this.mode;
  }

  public getTargetId(): string | null {
    return this.resolvedTargetId;
  }

  public updateTarget(
    camera: THREE.Camera,
    aimState: AimState,
    vehiclePosition: THREE.Vector3,
    vehicleHeading: number,
    aiTargetPosition: THREE.Vector3 | null,
    targetHeight: number,
    out: THREE.Vector3,
    availableEnemies: readonly EnemyTarget[] = [],
    designatedTargetId: string | null = null,
    activeWeapon?: WeaponConfig,
    weaponExecutor?: Pick<DefaultWeaponExecutor, "getRange">,
  ): THREE.Vector3 {
    const fireRange =
      weaponExecutor?.getRange() ??
      Math.max(
        activeWeapon?.preferredRange ?? 0,
        COMBAT_CONFIG.MAX_TARGET_RANGE,
      );
    const fallbackRange = Math.min(
      fireRange,
      activeWeapon?.preferredRange ?? fireRange,
    );

    if (this.mode === "manual") {
      this.resolvedTargetId = null;
      const hit = resolveCameraAim(camera, aimState, targetHeight, out);
      if (!hit) {
        fallbackAimTarget(
          vehiclePosition,
          vehicleHeading,
          fallbackRange,
          targetHeight,
          out,
        );
      }
      return clampToRange(vehiclePosition, out, fireRange);
    }

    const bestTarget = selectAimTarget(
      vehiclePosition,
      availableEnemies,
      designatedTargetId,
      fireRange,
    );

    if (bestTarget) {
      out.set(
        bestTarget.position[0],
        bestTarget.position[1],
        bestTarget.position[2],
      );
      this.resolvedTargetId = bestTarget.id;
      return clampToRange(vehiclePosition, out, fireRange);
    }

    this.resolvedTargetId = null;
    if (aiTargetPosition) {
      out.copy(aiTargetPosition);
      return clampToRange(vehiclePosition, out, fireRange);
    }

    fallbackAimTarget(
      vehiclePosition,
      vehicleHeading,
      fallbackRange,
      targetHeight,
      out,
    );
    return clampToRange(vehiclePosition, out, fireRange);
  }
}
