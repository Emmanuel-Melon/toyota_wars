// apps/toyota-wars/feature/vehciles/hooks/use-pickup-materials.ts
"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { VehiclePalette } from "@/lib/palettes";
import { createVehiclePaintPattern } from "../paint-pattern";

export function usePickupMaterials(
  palette: VehiclePalette,
  wrecked: boolean,
  seed: number,
) {
  const paintMap = useMemo(
    () => createVehiclePaintPattern(palette, seed),
    [palette.body, palette.cabin, palette.accent, seed],
  );

  const mats = useMemo(
    () => ({
      paint: new THREE.MeshStandardMaterial({
        map: paintMap,
        roughness: 0.5,
        metalness: 0.15,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: palette.accent,
        roughness: 0.7,
        metalness: 0.2,
      }),
      cabin: new THREE.MeshStandardMaterial({
        color: palette.cabin,
        roughness: 0.85,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#151515",
        roughness: 0.9,
      }),
      glass: new THREE.MeshStandardMaterial({
        color: wrecked ? "#080808" : "#1c2b33",
        roughness: 0.1,
        metalness: 0.6,
      }),
      glassCrack: new THREE.MeshStandardMaterial({
        color: "#d7f6ff",
        emissive: "#67d8ff",
        emissiveIntensity: 0.35,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: "#b8bbbf",
        roughness: 0.25,
        metalness: 0.8,
      }),
      headlight: new THREE.MeshStandardMaterial({
        color: "#fff4cf",
        emissive: "#fff0b8",
        emissiveIntensity: wrecked ? 0 : 0.7,
      }),
      taillight: new THREE.MeshStandardMaterial({
        color: "#a01515",
        emissive: "#d01818",
        emissiveIntensity: wrecked ? 0 : 0.6,
      }),
    }),
    [paintMap, palette.accent, wrecked],
  );

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
      paintMap.dispose();
    },
    [mats, paintMap],
  );

  return mats;
}
