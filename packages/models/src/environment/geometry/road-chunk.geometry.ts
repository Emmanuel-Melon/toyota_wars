// packages/models/src/environment/geometry/road-chunk.geometry.ts
import * as THREE from "three";
import type { RoadChunkRefVisual, TerrainSampler } from "../types";

const ROAD_SURFACE_LIFT = 0.03;
const TARGET_LATERAL_STEP = 2;
const BASE_LONGITUDINAL_SUBDIVISIONS = 4;
const MAX_TURN_SUBDIVISIONS = 16;
const MIN_LATERAL_SEGMENTS = 2;

function getSegmentSubdivisions(
  path: RoadChunkRefVisual["path"],
  i: number,
  next: number,
): number {
  if (i === next) return 1;
  const ax = path.dx[i];
  const az = path.dz[i];
  const bx = path.dx[next];
  const bz = path.dz[next];
  const lenA = Math.hypot(ax, az);
  const lenB = Math.hypot(bx, bz);
  if (lenA < 1e-6 || lenB < 1e-6) {
    return BASE_LONGITUDINAL_SUBDIVISIONS;
  }

  const dot = Math.max(-1, Math.min(1, (ax * bx + az * bz) / (lenA * lenB)));
  const angle = Math.acos(dot); // 0 = straight, PI = 180 deg turn
  const turnSteps = Math.ceil((angle / (Math.PI * 0.5)) * MAX_TURN_SUBDIVISIONS);

  const segDist = Math.hypot(path.x[next] - path.x[i], path.z[next] - path.z[i]);
  const lengthSteps = Math.ceil(segDist / 6);

  return Math.max(
    BASE_LONGITUDINAL_SUBDIVISIONS,
    Math.min(MAX_TURN_SUBDIVISIONS, Math.max(turnSteps, lengthSteps)),
  );
}

export function buildRoadChunkGeometry(
  { path, from, to }: RoadChunkRefVisual,
  terrain: TerrainSampler,
) {
  const lateralSegments = Math.max(
    MIN_LATERAL_SEGMENTS,
    Math.ceil(path.width / TARGET_LATERAL_STEP),
  );
  const columns = lateralSegments + 1;
  const half = path.width / 2;

  const segmentSteps: number[] = [];
  let totalRows = 1;
  for (let segment = 0; segment < to - from; segment++) {
    const steps = getSegmentSubdivisions(path, from + segment, from + segment + 1);
    segmentSteps.push(steps);
    totalRows += steps;
  }

  const pos = new Float32Array(totalRows * columns * 3);
  const uv = new Float32Array(totalRows * columns * 2);
  const idx: number[] = [];

  const writeRow = (row: number, i: number, next: number, t: number) => {
    const x0 = path.x[i];
    const z0 = path.z[i];
    const x1 = path.x[next];
    const z1 = path.z[next];

    const chordLen = Math.hypot(x1 - x0, z1 - z0);
    // Tangent scale controls how far the curve pulls along the entry/exit heading
    const tangentScale = Math.min(chordLen * 0.55, Math.max(chordLen * 0.35, path.width * 0.75));

    const len0 = Math.hypot(path.dx[i], path.dz[i]) || 1;
    const len1 = Math.hypot(path.dx[next], path.dz[next]) || 1;
    const m0x = (path.dx[i] / len0) * tangentScale;
    const m0z = (path.dz[i] / len0) * tangentScale;
    const m1x = (path.dx[next] / len1) * tangentScale;
    const m1z = (path.dz[next] / len1) * tangentScale;

    // Cubic Hermite basis functions
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const centerX = h00 * x0 + h10 * m0x + h01 * x1 + h11 * m1x;
    const centerZ = h00 * z0 + h10 * m0z + h01 * z1 + h11 * m1z;

    // Derivative of Hermite spline gives the true smooth curve tangent
    const dh00 = 6 * t2 - 6 * t;
    const dh10 = 3 * t2 - 4 * t + 1;
    const dh01 = -6 * t2 + 6 * t;
    const dh11 = 3 * t2 - 2 * t;

    const tx = dh00 * x0 + dh10 * m0x + dh01 * x1 + dh11 * m1x;
    const tz = dh00 * z0 + dh10 * m0z + dh01 * z1 + dh11 * m1z;
    const tLen = Math.hypot(tx, tz) || 1;
    const dirX = tx / tLen;
    const dirZ = tz / tLen;

    // Right-hand perpendicular in XZ
    const nx = -dirZ;
    const nz = dirX;

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

  let currentRow = 0;
  for (let segment = 0; segment < to - from; segment++) {
    const i = from + segment;
    const next = i + 1;
    const steps = segmentSteps[segment];
    for (let step = 0; step < steps; step++) {
      writeRow(currentRow++, i, next, step / steps);
    }
  }
  writeRow(currentRow, to, to, 0);

  for (let r = 0; r < totalRows - 1; r++) {
    for (let j = 0; j < lateralSegments; j++) {
      const a = r * columns + j;
      const b = a + 1;
      const c = a + columns;
      const d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(idx);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}