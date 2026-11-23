// toyota-wars/lib/tactics/tactics.orbit.ts
import * as THREE from "three";

export class OrbitTactic {
  private currentAngle = 0;

  public getNextOrbitPoint(
    targetPos: Readonly<THREE.Vector3>,
    currentPos: Readonly<THREE.Vector3>,
    orbitRadius: number,
    orbitSpeed: number,
    dt: number,
    outPoint: THREE.Vector3,
  ): THREE.Vector3 {
    const dx = currentPos.x - targetPos.x;
    const dz = currentPos.z - targetPos.z;
    this.currentAngle = Math.atan2(dx, dz);
    this.currentAngle += orbitSpeed * dt;

    outPoint.set(
      targetPos.x + Math.sin(this.currentAngle) * orbitRadius,
      targetPos.y,
      targetPos.z + Math.cos(this.currentAngle) * orbitRadius,
    );

    return outPoint;
  }
}
