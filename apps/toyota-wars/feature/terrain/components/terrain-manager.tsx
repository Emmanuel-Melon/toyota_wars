// apps/toyota-wars/feature/terrain/components/terrain-manager.tsx
"use client";

import { memo, useRef, useState } from "react";
import { useGameFrame } from "@/render-loop";
import {
  chunkKey,
  chunksAround,
  parseChunkKey,
  worldToChunk,
} from "@/lib/map/map.chunks";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import { TerrainChunk } from "./terrain-chunk";

type WorldPosition = { readonly x: number; readonly z: number };

interface TerrainManagerProps {
  playerBody: { readonly position: WorldPosition };
  terrain: TerrainSampler;
  chunkSize?: number;
  renderRadius?: number;
  segments?: number;
}

export const TerrainManager = memo(function TerrainManager({
  playerBody,
  terrain,
  chunkSize = 120,
  renderRadius = 1,
  segments = 64,
}: TerrainManagerProps) {
  const initialCenter = useRef(
    worldToChunk(playerBody.position.x, playerBody.position.z, chunkSize),
  ).current;
  const [activeChunks, setActiveChunks] = useState<string[]>(() =>
    chunksAround(initialCenter.x, initialCenter.z, renderRadius),
  );
  const centerRef = useRef(chunkKey(initialCenter.x, initialCenter.z));

  useGameFrame(() => {
    const center = worldToChunk(
      playerBody.position.x,
      playerBody.position.z,
      chunkSize,
    );
    const key = chunkKey(center.x, center.z);
    if (centerRef.current === key) return;

    centerRef.current = key;
    setActiveChunks(chunksAround(center.x, center.z, renderRadius));
  }, "presentation");

  return (
    <group>
      {activeChunks.map((key) => {
        const { x: cx, z: cz } = parseChunkKey(key);
        return (
          <TerrainChunk
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
