// lib/tanks/tanks.leader.ts
import * as THREE from "three";
import { wrapAngle } from "../movement/movement.math";

export class LeaderTracker {
  heading: number;
  private last = new THREE.Vector3();
  private hasLast = false;

  constructor(initialHeading: number) {
    this.heading = initialHeading;
  }

  update(pos: Readonly<THREE.Vector3>, dt: number, explicitHeading?: number) {
    if (explicitHeading !== undefined) {
      this.heading = explicitHeading;
    } else if (this.hasLast) {
      const dx = pos.x - this.last.x,
        dz = pos.z - this.last.z;
      if (dx * dx + dz * dz > 1e-6) {
        const target = Math.atan2(dx, dz);
        this.heading = wrapAngle(
          this.heading +
            wrapAngle(target - this.heading) * (1 - Math.exp(-8 * dt)),
        );
      }
    }
    this.last.copy(pos);
    this.hasLast = true;
  }
}
