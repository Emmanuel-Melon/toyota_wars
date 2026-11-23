// apps/toyota-wars/feature/vehciles/pickup.geometry.ts
import * as THREE from "three";
import {
  CAB_PILLARS,
  GEOMETRY,
  PICKUP,
  PICKUP_DERIVED,
  WINDSHIELD,
} from "./vehicles.config";
import { extrudeSide, lineWithArch } from "./vehicles.utils";

// Backward-compatible re-exports — prefer importing from ./vehicles.config.
export { PICKUP, WINDSHIELD };
export const BEVEL = GEOMETRY.bevel;
export const ARCH_CY = PICKUP_DERIVED.archCy;
export const FRONT_AXLE_Z = PICKUP_DERIVED.frontAxleZ;
export const REAR_AXLE_Z = PICKUP_DERIVED.rearAxleZ;

export function createCabGeometry() {
  const s = new THREE.Shape();
  s.moveTo(PICKUP.cabRearZ, 0);
  lineWithArch(s, FRONT_AXLE_Z, PICKUP.archR, ARCH_CY);
  s.lineTo(2.62, 0);
  s.lineTo(PICKUP.frontZ, 0.12);
  s.lineTo(PICKUP.frontZ, 0.5);
  s.lineTo(2.58, 0.66); // hood nose
  s.lineTo(1.25, 0.84); // hood rear
  s.lineTo(CAB_PILLARS.cowl.z, CAB_PILLARS.cowl.y); // cowl
  s.lineTo(CAB_PILLARS.aPillarTop.z, CAB_PILLARS.aPillarTop.y); // A-pillar top (windshield)
  s.lineTo(0.22, 1.5);
  s.lineTo(-0.72, 1.5); // roof
  s.lineTo(-0.86, 1.38);
  s.lineTo(PICKUP.cabRearZ, PICKUP.bedFloorY);
  s.closePath();
  return extrudeSide(s, PICKUP.width, BEVEL);
}

export function createHoodGeometry() {
  const s = new THREE.Shape();
  s.moveTo(1.22, 0.875);
  s.lineTo(2.59, 0.695);
  s.lineTo(2.59, 0.66);
  s.lineTo(1.22, 0.84);
  s.closePath();
  return extrudeSide(s, PICKUP.width - 0.12, 0.008);
}

export function createBedSideGeometry() {
  const s = new THREE.Shape();
  s.moveTo(PICKUP.rearZ, 0);
  lineWithArch(s, REAR_AXLE_Z, PICKUP.archR, ARCH_CY);
  s.lineTo(PICKUP.cabRearZ, 0);
  s.lineTo(PICKUP.cabRearZ, PICKUP.bedSideH);
  s.lineTo(PICKUP.rearZ, PICKUP.bedSideH);
  s.closePath();
  return extrudeSide(s, 0.07, 0);
}

/** Chunky fender flare that only covers the part of the arch above the body. */
export function createFlareGeometry() {
  const r = PICKUP.archR;
  const a0 = Math.asin(-ARCH_CY / r);
  const g = new THREE.TorusGeometry(r + 0.02, 0.035, 6, 20, Math.PI - 2 * a0);
  g.rotateZ(a0);
  g.rotateY(Math.PI / 2); // ring now lies in the z/y plane
  return g;
}
