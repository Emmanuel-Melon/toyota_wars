// packages/models/src/environment/components/structures/structure-assets.ts
import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";

const WALL_COLORS = [
  "#a78f6a",
  "#9d8464",
  "#b09a76",
  "#8f7a5e",
] as const;
const ROOF_COLOR = "#5d4634";
const TRIM_COLOR = "#4a3b2c";
const WOOD = "#5a4632";
const SANDBAG = "#8a7d5c";
const STRIPE_RED = "#9b2d20";
const STRIPE_WHITE = "#d8d2c4";

export function colorFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return WALL_COLORS[hash % WALL_COLORS.length];
}

/** Shared unit box + material set for every structure in the arena. */
export function useStructureAssets() {
  const unitBox = useMemo(() => new BoxGeometry(1, 1, 1), []);

  const sharedAssets = useMemo(() => {
    const trimMat = new MeshStandardMaterial({
      color: TRIM_COLOR,
      roughness: 0.9,
      metalness: 0.05,
    });
    const roofMat = new MeshStandardMaterial({
      color: ROOF_COLOR,
      roughness: 0.92,
      metalness: 0.08,
    });
    const woodMat = new MeshStandardMaterial({
      color: WOOD,
      roughness: 0.9,
      metalness: 0.02,
    });
    const sandbag = new MeshStandardMaterial({
      color: SANDBAG,
      roughness: 0.95,
      metalness: 0,
    });
    const stripeRed = new MeshStandardMaterial({
      color: STRIPE_RED,
      roughness: 0.8,
      metalness: 0.05,
    });
    const stripeWhite = new MeshStandardMaterial({
      color: STRIPE_WHITE,
      roughness: 0.8,
      metalness: 0.05,
    });
    const wallMats = new Map<string, MeshStandardMaterial>();
    for (const hex of WALL_COLORS) {
      wallMats.set(
        hex,
        new MeshStandardMaterial({
          color: hex,
          roughness: 0.88,
          metalness: 0.04,
        }),
      );
    }
    return {
      trimMat,
      roofMat,
      woodMat,
      sandbag,
      stripeRed,
      stripeWhite,
      wallMats,
    };
  }, []);

  useEffect(() => {
    return () => {
      unitBox.dispose();
      sharedAssets.trimMat.dispose();
      sharedAssets.roofMat.dispose();
      sharedAssets.woodMat.dispose();
      sharedAssets.sandbag.dispose();
      sharedAssets.stripeRed.dispose();
      sharedAssets.stripeWhite.dispose();
      sharedAssets.wallMats.forEach((m) => m.dispose());
    };
  }, [unitBox, sharedAssets]);

  return { unitBox, sharedAssets };
}
