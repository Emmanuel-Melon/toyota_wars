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
  const turnSteps = Math.ceil(
    (angle / (Math.PI * 0.5)) * MAX_TURN_SUBDIVISIONS,
  );

  const segDist = Math.hypot(
    path.x[next] - path.x[i],
    path.z[next] - path.z[i],
  );
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

  type Row = {
    x: number;
    z: number;
    dirX: number;
    dirZ: number;
    distance: number;
  };

  const sampleRow = (i: number, next: number, t: number): Row => {
    const x0 = path.x[i];
    const z0 = path.z[i];

    if (i === next) {
      const len = Math.hypot(path.dx[i], path.dz[i]) || 1;
      return {
        x: x0,
        z: z0,
        dirX: path.dx[i] / len,
        dirZ: path.dz[i] / len,
        distance: path.dist[i],
      };
    }

    const x1 = path.x[next];
    const z1 = path.z[next];
    const chordLen = Math.hypot(x1 - x0, z1 - z0);
    const tangentScale = Math.min(
      chordLen * 0.55,
      Math.max(chordLen * 0.35, path.width * 0.75),
    );

    const len0 = Math.hypot(path.dx[i], path.dz[i]) || 1;
    const len1 = Math.hypot(path.dx[next], path.dz[next]) || 1;
    const m0x = (path.dx[i] / len0) * tangentScale;
    const m0z = (path.dz[i] / len0) * tangentScale;
    const m1x = (path.dx[next] / len1) * tangentScale;
    const m1z = (path.dz[next] / len1) * tangentScale;

    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const centerX = h00 * x0 + h10 * m0x + h01 * x1 + h11 * m1x;
    const centerZ = h00 * z0 + h10 * m0z + h01 * z1 + h11 * m1z;

    const dh00 = 6 * t2 - 6 * t;
    const dh10 = 3 * t2 - 4 * t + 1;
    const dh01 = -6 * t2 + 6 * t;
    const dh11 = 3 * t2 - 2 * t;

    let tx = dh00 * x0 + dh10 * m0x + dh01 * x1 + dh11 * m1x;
    let tz = dh00 * z0 + dh10 * m0z + dh01 * z1 + dh11 * m1z;
    let tLen = Math.hypot(tx, tz);
    if (tLen < 1e-6) {
      tx = m1x || m0x;
      tz = m1z || m0z;
      tLen = Math.hypot(tx, tz) || 1;
    }

    return {
      x: centerX,
      z: centerZ,
      dirX: tx / tLen,
      dirZ: tz / tLen,
      distance: path.dist[i] + (path.dist[next] - path.dist[i]) * t,
    };
  };

  const rows: Row[] = [];
  for (let segment = 0; segment < to - from; segment++) {
    const i = from + segment;
    const next = i + 1;
    const steps = getSegmentSubdivisions(path, i, next);
    for (let step = 0; step < steps; step++) {
      rows.push(sampleRow(i, next, step / steps));
    }
  }
  rows.push(sampleRow(to, to, 0));

  const arc = new Float64Array(rows.length);
  for (let r = 1; r < rows.length; r++) {
    arc[r] =
      arc[r - 1] +
      Math.hypot(rows[r].x - rows[r - 1].x, rows[r].z - rows[r - 1].z);
  }
  const arcTotal = arc[arc.length - 1] || 1;
  const distanceStart = path.dist[from];
  const distanceSpan = path.dist[to] - distanceStart;
  for (let r = 0; r < rows.length; r++) {
    rows[r].distance =
      distanceSpan > 0
        ? distanceStart + (arc[r] / arcTotal) * distanceSpan
        : arc[r];
  }

  const turnSign = new Float32Array(rows.length);
  const innerLimit = new Float64Array(rows.length);
  innerLimit.fill(Infinity);
  for (let r = 0; r < rows.length; r++) {
    const prev = rows[Math.max(0, r - 1)];
    const next = rows[Math.min(rows.length - 1, r + 1)];
    const cross = prev.dirX * next.dirZ - prev.dirZ * next.dirX;
    const dot = prev.dirX * next.dirX + prev.dirZ * next.dirZ;
    const angle = Math.atan2(cross, dot);
    const span =
      arc[Math.min(rows.length - 1, r + 1)] - arc[Math.max(0, r - 1)];
    if (Math.abs(angle) > 1e-4 && span > 1e-4) {
      turnSign[r] = Math.sign(angle);
      innerLimit[r] = Math.max(0, (span / Math.abs(angle)) * 0.9);
    }
  }

  const pos = new Float32Array(rows.length * columns * 3);
  const uv = new Float32Array(rows.length * columns * 2);
  const idx: number[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const nx = -row.dirZ;
    const nz = row.dirX;
    for (let j = 0; j < columns; j++) {
      const lateral = -1 + (2 * j) / lateralSegments;
      const side = Math.sign(lateral);
      let offset = lateral * half;
      if (side === turnSign[r] && Number.isFinite(innerLimit[r])) {
        offset = side * Math.min(Math.abs(offset), innerLimit[r]);
      }
      const x = row.x + nx * offset;
      const z = row.z + nz * offset;
      const k = r * columns + j;
      pos[k * 3] = x;
      pos[k * 3 + 1] = terrain.getHeight(x, z) + ROAD_SURFACE_LIFT;
      pos[k * 3 + 2] = z;
      uv[k * 2] = (lateral + 1) / 2;
      uv[k * 2 + 1] = row.distance / path.width;
    }
  }

  for (let r = 0; r < rows.length - 1; r++) {
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
