// packages/models/src/environment/components/terrain-chunk.tsx
import { memo, useEffect, useMemo } from "react";
import * as THREE from "three";
import type { TerrainSampler } from "../types";
import { TerrainChunkMaterial } from "../materials/terrain-chunk-material";

type TerrainChunkProps = {
  chunkX: number;
  chunkZ: number;
  terrain: TerrainSampler;
  size?: number;
  segments?: number;
};

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

      const heightLeft = terrain.getHeight(worldX - delta, worldZ);
      const heightRight = terrain.getHeight(worldX + delta, worldZ);
      // localY + delta corresponds to worldZ - delta; localY - delta corresponds to worldZ + delta
      const heightLocalUp = terrain.getHeight(worldX, worldZ - delta);
      const heightLocalDown = terrain.getHeight(worldX, worldZ + delta);

      const nx = heightLeft - heightRight;
      const ny = heightLocalDown - heightLocalUp;
      const nz = 2 * delta;
      const length = Math.hypot(nx, ny, nz) || 1;
      normalAttribute.setXYZ(i, nx / length, ny / length, nz / length);
    }

    normalAttribute.needsUpdate = true;
    mesh.computeBoundingBox();
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
      <TerrainChunkMaterial size={size} />
    </mesh>
  );
});