// soldier/soldier.assets.ts
import { useMemo } from "react";
import {
  BoxGeometry, CylinderGeometry, DoubleSide, MeshStandardMaterial,
  SphereGeometry, TorusGeometry,
} from "three";
import type { ResolvedSoldierPalette } from "./soldier.types";

function createGeometries() {
  return {
    // head
    neck: new CylinderGeometry(0.055, 0.065, 0.12, 10),
    skull: new SphereGeometry(0.1, 16, 12),
    jaw: new BoxGeometry(0.13, 0.07, 0.12),
    nose: new BoxGeometry(0.025, 0.045, 0.04),
    ear: new SphereGeometry(0.027, 8, 8),
    eye: new SphereGeometry(0.011, 8, 8),
    helmetDome: new SphereGeometry(0.125, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    helmetRim: new TorusGeometry(0.121, 0.012, 8, 24),
    goggleStrap: new TorusGeometry(0.121, 0.009, 6, 24),
    lens: new CylinderGeometry(0.032, 0.032, 0.025, 12),
    headsetCup: new CylinderGeometry(0.045, 0.045, 0.03, 12),
    mic: new SphereGeometry(0.012, 8, 8),
    // torso
    chest: new CylinderGeometry(0.2, 0.16, 0.44, 14),
    collar: new CylinderGeometry(0.085, 0.095, 0.05, 12),
    vest: new CylinderGeometry(0.212, 0.178, 0.3, 14),
    strap: new BoxGeometry(0.07, 0.03, 0.2),
    pouch: new BoxGeometry(0.07, 0.1, 0.04),
    belt: new CylinderGeometry(0.172, 0.172, 0.05, 14),
    buckle: new BoxGeometry(0.05, 0.04, 0.015),
    radio: new BoxGeometry(0.2, 0.2, 0.07),
    // arms
    glove: new SphereGeometry(0.05, 10, 8),
    // legs
    pelvis: new CylinderGeometry(0.17, 0.165, 0.16, 14),
    bootShaft: new CylinderGeometry(0.05, 0.055, 0.1, 10),
    bootBody: new BoxGeometry(0.1, 0.09, 0.2),
    bootSole: new BoxGeometry(0.105, 0.03, 0.22),
  };
}

function createMaterials(p: ResolvedSoldierPalette) {
  const std = (color: string, roughness: number, metalness = 0) =>
    new MeshStandardMaterial({ color, roughness, metalness });

  return {
    skin: std(p.skin, 0.8),
    eye: std("#0d0d0d", 0.3),
    helmet: std(p.helmet, 0.6, 0.3),
    helmetDome: new MeshStandardMaterial({
      color: p.helmet, roughness: 0.6, metalness: 0.3, side: DoubleSide,
    }),
    goggleStrap: std("#111111", 0.9),
    lens: std(p.lens, 0.15, 0.7),
    headset: std("#17191a", 0.6),
    blackGear: std("#111111", 0.6),
    vest: std(p.vest, 0.7, 0.2),
    radio: std(p.vest, 0.6, 0.3),
    buckle: std("#6b6b66", 0.4, 0.8),
    glove: std(p.glove, 0.8),
    boot: std(p.boots, 0.7),
    sole: std("#0d0d0c", 0.95),
    // NOTE: replaces useCrewMaterials. Port the exact colors/roughness from it.
    uniformBody: std(p.uniform, 0.85),
    uniformLimb: std(p.uniform, 0.85),
    gearSoft: std(p.gear, 0.9),
    gearBelt: std(p.gear, 0.8),
  };
}

export type SoldierGeometries = ReturnType<typeof createGeometries>;
export type SoldierMaterials = ReturnType<typeof createMaterials>;
export interface SoldierAssets { geo: SoldierGeometries; mat: SoldierMaterials }

let sharedGeometries: SoldierGeometries | null = null;
const materialCache = new Map<string, SoldierMaterials>();

export function getSoldierAssets(palette: ResolvedSoldierPalette): SoldierAssets {
  const geo = (sharedGeometries ??= createGeometries());
  const key = JSON.stringify(palette); // resolved palettes always have the same key order
  let mat = materialCache.get(key);
  if (!mat) {
    mat = createMaterials(palette);
    materialCache.set(key, mat);
  }
  return { geo, mat };
}

export function useSoldierAssets(palette: ResolvedSoldierPalette): SoldierAssets {
  const key = JSON.stringify(palette);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getSoldierAssets(palette), [key]);
}