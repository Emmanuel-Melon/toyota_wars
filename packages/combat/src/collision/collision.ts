import * as THREE from "three";

const ab = new THREE.Vector3();
const ac = new THREE.Vector3();
const closestPoint = new THREE.Vector3();

/**
 * Tests segment-sphere intersection and returns the parametric `t` (0..1) if hit, else `null`.
 * Optionally writes the exact intersection/closest point into `outIntersectionPoint`.
 */
export function intersectSegmentSphere(
  segmentStart: Readonly<THREE.Vector3>,
  segmentEnd: Readonly<THREE.Vector3>,
  sphereCenter: Readonly<THREE.Vector3>,
  sphereRadius: number,
  outIntersectionPoint?: THREE.Vector3,
): number | null {
  ab.subVectors(segmentEnd, segmentStart);
  ac.subVectors(sphereCenter, segmentStart);

  const abLenSq = ab.lengthSq();
  if (abLenSq <= 1e-8) {
    if (segmentStart.distanceToSquared(sphereCenter) <= sphereRadius ** 2) {
      outIntersectionPoint?.copy(segmentStart);
      return 0;
    }
    return null;
  }

  const t = THREE.MathUtils.clamp(ac.dot(ab) / abLenSq, 0, 1);
  closestPoint.copy(segmentStart).addScaledVector(ab, t);

  const distSq = closestPoint.distanceToSquared(sphereCenter);
  if (distSq <= sphereRadius ** 2) {
    outIntersectionPoint?.copy(closestPoint);
    return t;
  }

  return null;
}

export function outOfBounds(
  p: Readonly<THREE.Vector3>,
  bounds: number,
): boolean {
  return Math.abs(p.x) > bounds || Math.abs(p.z) > bounds;
}
