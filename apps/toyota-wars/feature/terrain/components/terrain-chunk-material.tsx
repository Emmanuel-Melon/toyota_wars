// apps/toyota-wars/feature/terrain/components/terrain-chunk-material.tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { getProceduralGroundTextures } from "@/lib/map/texture.generator";

interface TerrainChunkMaterialProps {
  size: number;
}

export function TerrainChunkMaterial({ size }: TerrainChunkMaterialProps) {
  // Shared, cached textures avoid regenerating canvases while chunks stream.
  const repeatScale = size / 12; // Adjust scale for density
  const { colorMap, roughnessMap } = useMemo(
    () => getProceduralGroundTextures(repeatScale),
    [repeatScale],
  );

  return (
    <meshStandardMaterial
      map={colorMap}
      roughnessMap={roughnessMap}
      roughness={0.85}
      metalness={0.05}
    />
  );
}
