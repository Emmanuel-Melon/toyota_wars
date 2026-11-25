// apps/toyota-wars/feature/terrain/components/terrain-manager.tsx
"use client";

import { memo, useMemo } from "react";
import { Environment } from "@toyota/models";
import type { TerrainSampler } from "@/lib/map/map.terrain";

interface TerrainManagerProps {
  bound: number;
  terrain: TerrainSampler;
  chunkSize?: number;
  segments?: number;
}

export const TerrainManager = memo(function TerrainManager({
  bound,
  terrain,
  chunkSize = 120,
  segments = 64,
}: TerrainManagerProps) {
  const chunks = useMemo(
    () => Environment.chunksInBounds(bound, chunkSize),
    [bound, chunkSize],
  );

  return (
    <group>
      {chunks.map((key) => {
        const { x: cx, z: cz } = Environment.parseChunkKey(key);
        return (
          <Environment.TerrainChunk
            key={key}
            chunkX={cx}
            chunkZ={cz}
            terrain={terrain}
            size={chunkSize}
            segments={segments}
          />
        );
      })}
    </group>
  );
});
