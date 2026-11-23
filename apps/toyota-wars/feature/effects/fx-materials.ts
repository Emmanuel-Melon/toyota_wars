// apps/toyota-wars/feature/effects/fx-materials.ts
"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

export function useAdditiveFxMaterial() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);
  return material;
}

export function useSmokeFxMaterial() {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);
  return material;
}

export function useCasingFxResources() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.55,
        roughness: 0.4,
      }),
    [],
  );
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
    [],
  );

  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  return { material, geometry };
}
