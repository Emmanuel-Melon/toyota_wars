// apps/toyota-wars/feature/vehciles/vehicles.utils.ts
import * as THREE from "three";

export type {
  MotionSource,
  VehicleMotion,
} from "@/lib/vehicles/vehicle.motion";
export {
  steerFromYawRate,
  updateVehicleMotion,
} from "@/lib/vehicles/vehicle.motion";

/**
 * Extrude a 2D (z, y) shape across the vehicle's width (x).
 * The shape's x-axis becomes world z; the extrusion becomes world x.
 */
export function extrudeSide(
  shape: THREE.Shape,
  width: number,
  bevel: number,
): THREE.ExtrudeGeometry {
  const depth = width - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 12,
  });
  g.rotateY(-Math.PI / 2); // shape x -> world z, extrude -> world x
  g.translate(depth / 2, 0, 0);
  return g;
}

/**
 * Walk the bottom edge (z increasing) around a wheel arch on a 2D profile.
 * The caller is expected to have positioned the path at y = 0.
 */
export function lineWithArch(
  s: THREE.Shape,
  cz: number,
  radius: number,
  archCy: number,
): void {
  const r = radius;
  const a0 = Math.asin(-archCy / r);
  s.lineTo(cz - r * Math.cos(a0), 0);
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const t = Math.PI - a0 - ((Math.PI - 2 * a0) * i) / steps;
    s.lineTo(cz + r * Math.cos(t), archCy + r * Math.sin(t));
  }
}
