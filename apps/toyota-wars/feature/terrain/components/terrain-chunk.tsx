// apps/toyota-wars/feature/terrain/components/terrain-chunk.tsx (Updated)
"use client";

import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import { TerrainChunkMaterial } from "./terrain-chunk-material";

interface TerrainChunkProps {
  chunkX: number;
  chunkZ: number;
  terrain: TerrainSampler;
  size?: number;
  segments?: number;
}

export const TerrainChunk = memo(function TerrainChunk({
  chunkX,
  chunkZ,
  terrain,
  size = 120,
  segments = 64,
}: TerrainChunkProps) {
  const originX = chunkX * size;
  const originZ = chunkZ * size;

  const geometry = useMemo(() => {
    const mesh = new THREE.PlaneGeometry(size, size, segments, segments);
    const posAttribute = mesh.attributes.position;
    const normalAttribute = mesh.attributes.normal;

    for (let i = 0; i < posAttribute.count; i++) {
      const localX = posAttribute.getX(i);
      const localY = posAttribute.getY(i);

      const worldX = localX + originX;
      const worldZ = originZ - localY;

      posAttribute.setZ(i, terrain.getHeight(worldX, worldZ));
    }

    posAttribute.needsUpdate = true;
    const delta = size / segments;
    for (let i = 0; i < posAttribute.count; i++) {
      const localX = posAttribute.getX(i);
      const localY = posAttribute.getY(i);
      const worldX = localX + originX;
      const worldZ = originZ - localY;
      const heightL = terrain.getHeight(worldX - delta, worldZ);
      const heightR = terrain.getHeight(worldX + delta, worldZ);
      const heightD = terrain.getHeight(worldX, worldZ - delta);
      const heightU = terrain.getHeight(worldX, worldZ + delta);
      const nx = heightL - heightR;
      const ny = heightU - heightD;
      const nz = 2 * delta;
      const length = Math.hypot(nx, ny, nz) || 1;
      normalAttribute.setXYZ(i, nx / length, ny / length, nz / length);
    }
    normalAttribute.needsUpdate = true;
    mesh.computeBoundingSphere();
    return mesh;
  }, [originX, originZ, size, segments, terrain]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      position={[originX, 0, originZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      receiveShadow
    >
      {/* Replaced flat color material with tiled PBR textures */}
      <TerrainChunkMaterial size={size} />
    </mesh>
  );
});
