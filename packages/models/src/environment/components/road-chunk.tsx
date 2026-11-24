// packages/models/src/environment/components/road-chunk.tsx
import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";
import { buildRoadChunkGeometry } from "../geometry/road-chunk.geometry";
import type { RoadChunkRefVisual, TerrainSampler } from "../types";

type RoadChunkProps = {
  chunk: RoadChunkRefVisual;
  terrain: TerrainSampler;
  material: THREE.Material;
};

export const RoadChunk = memo(function RoadChunk({
  chunk,
  terrain,
  material,
}: RoadChunkProps) {
  const geometry = useMemo(
    () => buildRoadChunkGeometry(chunk, terrain),
    [chunk, terrain],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      material={material}
      renderOrder={1}
      receiveShadow
      castShadow={false}
    />
  );
});