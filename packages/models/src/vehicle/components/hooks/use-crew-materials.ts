// packages/models/src/vehicle/components/hooks/use-crew-materials.ts
import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { ResolvedPalette } from "../../types";

export type SharedCrewMaterials = {
  uniformLimb: MeshStandardMaterial;
  uniformBody: MeshStandardMaterial;
  gearSoft: MeshStandardMaterial;
  gearBelt: MeshStandardMaterial;
};

export function useCrewMaterials(
  palette: ResolvedPalette,
  external?: SharedCrewMaterials,
): SharedCrewMaterials {
  const owned = useMemo<SharedCrewMaterials | null>(() => {
    if (external) {
      return null;
    }
    return {
      uniformLimb: new MeshStandardMaterial({
        color: palette.uniform,
        roughness: 0.9,
      }),
      uniformBody: new MeshStandardMaterial({
        color: palette.uniform,
        roughness: 0.85,
      }),
      gearSoft: new MeshStandardMaterial({
        color: palette.gear,
        roughness: 0.9,
      }),
      gearBelt: new MeshStandardMaterial({
        color: palette.gear,
        roughness: 0.8,
      }),
    };
  }, [external, palette.uniform, palette.gear]);

  useEffect(() => {
    if (!owned) {
      return;
    }
    return () => {
      owned.uniformLimb.dispose();
      owned.uniformBody.dispose();
      owned.gearSoft.dispose();
      owned.gearBelt.dispose();
    };
  }, [owned]);

  return external ?? owned!;
}