// apps/toyota-wars/lib/weapons/weapon.celebration.ts
import * as THREE from "three";
import type { WeaponTimer } from "./weapon.types";

const SPIN_SPEED = (Math.PI * 2) / 1.6;
const AIM_RADIUS = 30;
const AIM_ELEVATION = 10;
const FIRST_SHOT_DELAY = 0.25;
const TAIL_DURATION = 1.1;

export class WeaponCelebrationSystem {
  private celebrating = false;
  private elapsed = 0;
  private duration = 0;
  private angle = 0;
  private shotsFired = 0;
  private maxShots = 0;
  private shotInterval = 0;
  private nextShotAt = 0;

  get active(): boolean {
    return this.celebrating;
  }

  get spinAngle(): number {
    return this.angle;
  }

  get pitch(): number {
    return -Math.atan2(AIM_ELEVATION, AIM_RADIUS);
  }

  setSpinAngle(angle: number): void {
    this.angle = angle;
  }

  reset(): void {
    this.celebrating = false;
    this.elapsed = 0;
    this.duration = 0;
    this.angle = 0;
    this.shotsFired = 0;
    this.maxShots = 0;
    this.shotInterval = 0;
    this.nextShotAt = 0;
  }

  triggerCelebration(cooldown: number, maxShots = 5): void {
    this.celebrating = true;
    this.elapsed = 0;
    this.shotsFired = 0;
    this.maxShots = Math.max(1, Math.round(maxShots));
    this.shotInterval = Math.max(cooldown, 0.15);
    this.duration = (this.maxShots - 1) * this.shotInterval + TAIL_DURATION;
    this.nextShotAt = FIRST_SHOT_DELAY;
    this.angle = 0;
  }

  update(
    delta: number,
    vehiclePosition: THREE.Vector3,
    vehicleHeading: number,
    weaponTimer: WeaponTimer,
    outAimPoint: THREE.Vector3,
  ): boolean {
    if (!this.celebrating) return false;

    const step = Math.max(0, delta);
    this.elapsed += step;
    this.angle += step * SPIN_SPEED;

    const heading = vehicleHeading + this.angle;
    outAimPoint.set(
      vehiclePosition.x + Math.sin(heading) * AIM_RADIUS,
      vehiclePosition.y + AIM_ELEVATION,
      vehiclePosition.z + Math.cos(heading) * AIM_RADIUS,
    );

    if (this.elapsed >= this.duration) {
      this.celebrating = false;
      return false;
    }

    if (
      this.shotsFired >= this.maxShots ||
      this.elapsed < this.nextShotAt ||
      !weaponTimer.ready
    ) {
      return false;
    }

    if (!weaponTimer.tryFire()) return false;
    this.shotsFired += 1;
    this.nextShotAt = this.elapsed + this.shotInterval;
    return true;
  }
}
