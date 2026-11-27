// packages/models/src/environment/components/terrain-chunk.tsx
import { memo, useMemo } from "react";
import * as THREE from "three";
import type { TerrainSampler } from "../types";
import { TerrainChunkMaterial } from "../materials/terrain-chunk-material";

type TerrainChunkProps = {
  chunkX: number;
  chunkZ: number;
  terrain: TerrainSampler;
  size?: number;
  segments?: number;
  worldMin: [number, number];
  worldSpan: number;
  trackMap: THREE.Texture;
};

const geometryCaches = new WeakMap<
  TerrainSampler,
  Map<string, THREE.PlaneGeometry>
>();

function geometryKey(
  chunkX: number,
  chunkZ: number,
  size: number,
  segments: number,
): string {
  return `${chunkX}:${chunkZ}:${size}:${segments}`;
}

function buildGeometry(
  originX: number,
  originZ: number,
  size: number,
  segments: number,
  terrain: TerrainSampler,
): THREE.PlaneGeometry {
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
}

export function clearTerrainChunkGeometry(terrain: TerrainSampler): void {
  const cache = geometryCaches.get(terrain);
  if (!cache) return;
  cache.forEach((geometry) => geometry.dispose());
  geometryCaches.delete(terrain);
}

export const TerrainChunk = memo(function TerrainChunk({
  chunkX,
  chunkZ,
  terrain,
  size = 120,
  segments = 64,
  worldMin,
  worldSpan,
  trackMap,
}: TerrainChunkProps) {
  const originX = chunkX * size;
  const originZ = chunkZ * size;

  const geometry = useMemo(() => {
    let cache = geometryCaches.get(terrain);
    if (!cache) {
      cache = new Map();
      geometryCaches.set(terrain, cache);
    }

    const key = geometryKey(chunkX, chunkZ, size, segments);
    let mesh = cache.get(key);
    if (!mesh) {
      mesh = buildGeometry(originX, originZ, size, segments, terrain);
      cache.set(key, mesh);
    }
    return mesh;
  }, [chunkX, chunkZ, originX, originZ, size, segments, terrain]);

  return (
    <mesh
      position={[originX, 0, originZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      receiveShadow
    >
      <TerrainChunkMaterial
        size={size}
        chunkX={chunkX}
        chunkZ={chunkZ}
        worldMin={worldMin}
        worldSpan={worldSpan}
        trackMap={trackMap}
      />
    </mesh>
  );
});
