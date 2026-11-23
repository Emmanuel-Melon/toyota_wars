import * as THREE from "three";
import type { WeaponState } from "../weapon.types";
import type { WeaponTargetContext } from "../weapon.executor";
import type { AimingStrategy } from "@/lib/aim/aim.types";

export class AutoAimingStrategy implements AimingStrategy {
  getDesiredHeading(_state: WeaponState, context: WeaponTargetContext) {
    if (!context.targetPosition) {
      return { heading: 0, targetPoint: null };
    }
    const dx = context.targetPosition.x - _state.position.x;
    const dz = context.targetPosition.z - _state.position.z;
    const heading = Math.atan2(dx, dz);
    return { heading, targetPoint: context.targetPosition.clone() };
  }
}
