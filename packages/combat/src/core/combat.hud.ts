// lib/combat/combat.hud.ts
import * as THREE from "three";

const ndcVector = new THREE.Vector3();

export type ScreenPosition = {
  x: number;
  y: number;
  visible: boolean;
};

export function projectWorldToScreen(
  worldPosition: Readonly<THREE.Vector3>,
  camera: THREE.Camera,
  screenWidth: number,
  screenHeight: number,
  outScreenPos: ScreenPosition,
): ScreenPosition {
  ndcVector.copy(worldPosition);
  ndcVector.project(camera);

  if (ndcVector.z > 1) {
    outScreenPos.visible = false;
    return outScreenPos;
  }

  outScreenPos.x = (ndcVector.x * 0.5 + 0.5) * screenWidth;
  outScreenPos.y = (-ndcVector.y * 0.5 + 0.5) * screenHeight;
  outScreenPos.visible = true;

  return outScreenPos;
}
