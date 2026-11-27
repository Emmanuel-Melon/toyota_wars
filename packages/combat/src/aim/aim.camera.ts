// lib/aim/aim.camera.ts
import * as THREE from "three";
import type { AimState } from "./aim.types";

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const plane = new THREE.Plane();
const up = new THREE.Vector3(0, 1, 0);

export function resolveCameraAim(
  camera: THREE.Camera,
  aim: AimState,
  targetHeight: number,
  outTarget: THREE.Vector3,
): boolean {
  ndc.set(aim.x, aim.y);
  camera.updateMatrixWorld();
  raycaster.setFromCamera(ndc, camera);
  plane.set(up, -targetHeight);
  return raycaster.ray.intersectPlane(plane, outTarget) !== null;
}
