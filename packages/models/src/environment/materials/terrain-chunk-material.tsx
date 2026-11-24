import { useMemo } from "react";
import { getProceduralGroundTextures } from "../textures/ground.texture";

export function TerrainChunkMaterial({ size }: { size: number }) {
  const repeatScale = size / 12;
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
