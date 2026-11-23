// lib/weapons/weapon.timer.ts
import type { WeaponTimer } from "./weapon.types";

export class Weapon implements WeaponTimer {
  private cooldown = 0;

  constructor(private interval: number) {}

  get ready() {
    return this.cooldown <= 0;
  }

  tick(dt: number) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  tryFire(): boolean {
    if (!this.ready) return false;
    this.cooldown = this.interval;
    return true;
  }
}
