// apps/toyota-wars/feature/terrain/components/terrain-manager.tsx
"use client";

import { memo, useEffect, useMemo } from "react";
import { Environment } from "@toyota/models";
import * as THREE from "three";
import type { RoadNetwork } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";

type WorldPoint = { readonly x: number; readonly z: number };

interface TerrainManagerProps {
  focus: WorldPoint;
  bound: number;
  terrain: TerrainSampler;
  network: RoadNetwork;
  wheelTrackMap: THREE.Texture;
  chunkSize?: number;
  segments?: number;
  renderRadius?: number;
}

type ViewChunk = {
  key: string;
  chunkX: number;
  chunkZ: number;
  segments: number;
};

const TRACK_TEXTURE_SIZE = 256;

function createTrackMap(network: RoadNetwork, bound: number): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TRACK_TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    texture.needsUpdate = true;
    return texture;
  }

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, TRACK_TEXTURE_SIZE, TRACK_TEXTURE_SIZE);
  ctx.strokeStyle = "#ffffff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const span = Math.max(1, bound * 2);
  const scale = TRACK_TEXTURE_SIZE / span;
  for (const path of network.paths) {
    ctx.lineWidth = Math.max(1, path.width * scale);
    ctx.beginPath();
    for (let i = 0; i < path.count; i++) {
      const px = ((path.x[i] + bound) / span) * TRACK_TEXTURE_SIZE;
      const py = ((path.z[i] + bound) / span) * TRACK_TEXTURE_SIZE;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

function segmentsForRing(
  ring: number,
  renderRadius: number,
  nearSegments: number,
): number {
  const near = Math.min(64, Math.max(48, nearSegments));
  const nearRings = Math.max(1, Math.ceil(renderRadius * 0.18));
  const midRings = Math.max(nearRings + 1, Math.ceil(renderRadius * 0.55));
  if (ring <= nearRings) return near;
  if (ring <= midRings) return 16;
  return 8;
}

export const TerrainManager = memo(function TerrainManager({
  focus,
  bound,
  terrain,
  network,
  wheelTrackMap,
  chunkSize = 120,
  segments = 64,
  renderRadius = 2,
}: TerrainManagerProps) {
  const view = useMemo(() => {
    const center = Environment.worldToChunk(focus.x, focus.z, chunkSize);
    const min = Environment.worldToChunk(-bound, -bound, chunkSize);
    const max = Environment.worldToChunk(bound, bound, chunkSize);

    const chunks: ViewChunk[] = [];
    for (const key of Environment.chunksAround(center, renderRadius)) {
      const { x, z } = Environment.parseChunkKey(key);
      if (x < min.x || x > max.x || z < min.z || z > max.z) continue;
      const ring = Math.max(Math.abs(x - center.x), Math.abs(z - center.z));
      chunks.push({
        key,
        chunkX: x,
        chunkZ: z,
        segments: segmentsForRing(ring, renderRadius, segments),
      });
    }
    return chunks;
  }, [bound, chunkSize, focus.x, focus.z, renderRadius, segments]);

  const trackMap = useMemo(
    () => createTrackMap(network, bound),
    [bound, network],
  );
  const worldMin = useMemo<[number, number]>(() => [-bound, -bound], [bound]);
  const worldSpan = Math.max(1, bound * 2);

  useEffect(() => () => trackMap.dispose(), [trackMap]);
  useEffect(
    () => () => Environment.clearTerrainChunkGeometry(terrain),
    [terrain],
  );

  return (
    <group>
      {view.map((chunk) => (
        <Environment.TerrainChunk
          key={chunk.key}
          chunkX={chunk.chunkX}
          chunkZ={chunk.chunkZ}
          terrain={terrain}
          size={chunkSize}
          segments={chunk.segments}
          worldMin={worldMin}
          worldSpan={worldSpan}
          trackMap={trackMap}
          wheelTrackMap={wheelTrackMap}
        />
      ))}
    </group>
  );
});
