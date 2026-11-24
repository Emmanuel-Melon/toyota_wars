import * as THREE from "three";
import {
  ARCH_CY,
  BEVEL,
  CAB_PILLARS,
  FRONT_AXLE_Z,
  GEOMETRY,
  PICKUP,
  REAR_AXLE_Z,
} from "../config/vehicle-visual.config";
import { extrudeSide, lineWithArch } from "./shape";

export function createCabGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(PICKUP.cabRearZ, 0);
  lineWithArch(shape, FRONT_AXLE_Z, PICKUP.archR, ARCH_CY);
  shape.lineTo(2.62, 0);
  shape.lineTo(PICKUP.frontZ, 0.12);
  shape.lineTo(PICKUP.frontZ, 0.5);
  shape.lineTo(2.58, 0.66);
  shape.lineTo(1.25, 0.84);
  shape.lineTo(CAB_PILLARS.cowl.z, CAB_PILLARS.cowl.y);
  shape.lineTo(CAB_PILLARS.aPillarTop.z, CAB_PILLARS.aPillarTop.y);
  shape.lineTo(0.22, 1.5);
  shape.lineTo(-0.72, 1.5);
  shape.lineTo(-0.86, 1.38);
  shape.lineTo(PICKUP.cabRearZ, PICKUP.bedFloorY);
  shape.closePath();
  return extrudeSide(shape, PICKUP.width, BEVEL);
}

export function createHoodGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(1.22, 0.875);
  shape.lineTo(2.59, 0.695);
  shape.lineTo(2.59, 0.66);
  shape.lineTo(1.22, 0.84);
  shape.closePath();
  return extrudeSide(shape, PICKUP.width - 0.12, 0.008);
}

export function createBedSideGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(PICKUP.rearZ, 0);
  lineWithArch(shape, REAR_AXLE_Z, PICKUP.archR, ARCH_CY);
  shape.lineTo(PICKUP.cabRearZ, 0);
  shape.lineTo(PICKUP.cabRearZ, PICKUP.bedSideH);
  shape.lineTo(PICKUP.rearZ, PICKUP.bedSideH);
  shape.closePath();
  return extrudeSide(shape, 0.07, 0);
}

export function createFlareGeometry() {
  const radius = PICKUP.archR;
  const startAngle = Math.asin(-ARCH_CY / radius);
  const geometry = new THREE.TorusGeometry(
    radius + 0.02,
    0.035,
    6,
    20,
    Math.PI - 2 * startAngle,
  );
  geometry.rotateZ(startAngle);
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

export const PICKUP_GEOMETRY_CONSTANTS = GEOMETRY;
