// apps/toyota-wars/lib/aim/aim.controller.ts
import * as THREE from "three";
import { resolveCameraAim } from "./aim.camera";
import { fallbackAimTarget } from "./aim.math";
import { selectBestTarget } from "../target/target.selector";
import type { EnemyTarget } from "../combat/combat.types";
import type { WeaponConfig } from "../weapons/weapon.types";
import type { AimState, AimingMode } from "./aim.types";

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

  /**
   * Resolves the target point based on the active mode:
   * - Manual: Raycasts from the player's camera reticle into the world.
   * - Auto: Locks onto the AI gunner's prioritized enemy target position using weapon engagement range.
   */
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
  ): THREE.Vector3 {
    if (this.mode === "manual") {
      this.resolvedTargetId = null;
      const hit = resolveCameraAim(camera, aimState, targetHeight, out);
      if (!hit) {
        fallbackAimTarget(
          vehiclePosition,
          vehicleHeading,
          50,
          targetHeight,
          out,
        );
      }
      return out;
    }

    const engagementRange = activeWeapon?.engagementRange ?? 200;
    const bestTarget = selectBestTarget(
      vehiclePosition,
      availableEnemies,
      designatedTargetId,
      engagementRange,
    );

    if (bestTarget) {
      out.set(
        bestTarget.position[0],
        bestTarget.position[1],
        bestTarget.position[2],
      );
      this.resolvedTargetId = bestTarget.id;
    } else {
      this.resolvedTargetId = null;
      if (aiTargetPosition) {
        out.copy(aiTargetPosition);
      } else {
        const fallbackDist = activeWeapon
          ? Math.min(activeWeapon.preferredRange, 100)
          : 40;
        fallbackAimTarget(
          vehiclePosition,
          vehicleHeading,
          fallbackDist,
          targetHeight,
          out,
        );
      }
    }
    return out;
  }
}
