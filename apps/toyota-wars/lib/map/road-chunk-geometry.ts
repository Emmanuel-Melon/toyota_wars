// components/plains/three/road-chunk-geometry.ts
import * as THREE from "three";
import type { RoadChunkRef } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";

const ROAD_SURFACE_LIFT = 0.1;
const TARGET_LATERAL_STEP = 2;
const LONGITUDINAL_SUBDIVISIONS = 2;
const MIN_LATERAL_SEGMENTS = 2;

export function buildRoadChunkGeometry(
  { path, from, to }: RoadChunkRef,
  terrain: TerrainSampler,
) {
  const lateralSegments = Math.max(
    MIN_LATERAL_SEGMENTS,
    Math.ceil(path.width / TARGET_LATERAL_STEP),
  );
  const columns = lateralSegments + 1;
  const rows = (to - from) * LONGITUDINAL_SUBDIVISIONS + 1;
  const pos = new Float32Array(rows * columns * 3);
  const uv = new Float32Array(rows * columns * 2);
  const idx: number[] = [];
  const half = path.width / 2;

  const writeRow = (row: number, i: number, next: number, t: number) => {
    const x0 = path.x[i];
    const z0 = path.z[i];
    const x1 = path.x[next];
    const z1 = path.z[next];
    const centerX = x0 + (x1 - x0) * t;
    const centerZ = z0 + (z1 - z0) * t;

    const dx0 = path.dx[i];
    const dz0 = path.dz[i];
    const dx = dx0 + (path.dx[next] - dx0) * t;
    const dz = dz0 + (path.dz[next] - dz0) * t;
    const length = Math.hypot(dx, dz) || 1;
    const nx = -dz / length;
    const nz = dx / length;
    const distance = path.dist[i] + (path.dist[next] - path.dist[i]) * t;

    for (let j = 0; j < columns; j++) {
      const lateral = -1 + (2 * j) / lateralSegments;
      const offset = lateral * half;
      const x = centerX + nx * offset;
      const z = centerZ + nz * offset;
      const k = row * columns + j;
      pos.set([x, terrain.getHeight(x, z) + ROAD_SURFACE_LIFT, z], k * 3);
      uv.set([(lateral + 1) / 2, distance / path.width], k * 2);
    }
  };

  for (let segment = 0; segment < to - from; segment++) {
    for (let step = 0; step < LONGITUDINAL_SUBDIVISIONS; step++) {
      writeRow(
        segment * LONGITUDINAL_SUBDIVISIONS + step,
        from + segment,
        from + segment + 1,
        step / LONGITUDINAL_SUBDIVISIONS,
      );
    }
  }
  writeRow(rows - 1, to, to, 0);

  for (let r = 0; r < rows - 1; r++) {
    for (let j = 0; j < lateralSegments; j++) {
      const a = r * columns + j;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
