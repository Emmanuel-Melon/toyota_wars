// lib/weapons/weapon.executor.ts (Updated)
import * as THREE from "three";
import { aimHeading, alignmentError } from "../aim/aim.math";
import type { WeaponOrder, WeaponState, WeaponTimer } from "./weapon.types";
import type { AimingStrategy } from "@/lib/aim/aim.types";

export interface WeaponExecutionConfig {
  range: number;
  alignmentToleranceRad: number;
}

export interface WeaponTargetContext {
  targetPosition: Readonly<THREE.Vector3> | null;
  canFireWhileMoving: boolean;
}

type FireOrder = Extract<WeaponOrder, { type: "fireAt" }>;

export class DefaultWeaponExecutor {
  private _opportunity: FireOrder = {
    type: "fireAt",
    point: new THREE.Vector3(),
    requireAlignment: true,
  };

  constructor(
    private weapon: WeaponTimer,
    private config: WeaponExecutionConfig,
    private aimingStrategy: AimingStrategy,
  ) {}

  get ready(): boolean {
    return this.weapon.ready;
  }

  tick(dt: number): void {
    this.weapon.tick(dt);
  }

  setRange(range: number): void {
    this.config.range = range;
  }

  resolveOrder(
    order: WeaponOrder,
    state: WeaponState,
    context: WeaponTargetContext,
    manualInputAngle?: number,
  ): WeaponOrder {
    // Get the target point and heading based on the active strategy (Manual vs Auto)
    const { targetPoint } = this.aimingStrategy.getDesiredHeading(
      state,
      context,
      manualInputAngle,
    );

    if (!targetPoint) return { type: "hold" };
    if (state.position.distanceTo(targetPoint) > this.config.range) {
      return { type: "hold" };
    }

    this._opportunity.point = targetPoint;
    this._opportunity.requireAlignment =
      order.type === "fireAt" ? order.requireAlignment : true;
    return this._opportunity;
  }

  execute(order: WeaponOrder, state: WeaponState): number | null {
    if (order.type !== "fireAt") return null;
    if (state.position.distanceTo(order.point) > this.config.range) {
      return null;
    }

    const heading = aimHeading(state.position, order.point);
    if (
      order.requireAlignment &&
      Math.abs(alignmentError(state.heading, heading)) >
        this.config.alignmentToleranceRad
    ) {
      return null; // Waiting for turret/vehicle alignment before firing burst
    }

    return this.weapon.tryFire() ? heading : null;
  }
}
