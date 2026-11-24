// lib/map/map.network.ts
import type { TerrainSampler } from "./map.terrain";
import type { LocationDef, LocationId, RoadDef, WorldDef } from "./map.world";

const SAMPLE_SPACING = 4; // metres between road samples
const CONTROL_SPACING = 220; // metres between meander control points
const SHOULDER = 10; // road -> terrain blend distance
const PAD_SHOULDER = 25; // location pad -> terrain blend distance
const CELL = 32; // spatial hash cell (>= SHOULDER + half width + spacing)
const CHUNK_SAMPLES = 24; // ~96 m per streamed road chunk
const SMOOTH_RADIUS = 8; // grade smoothing (samples)
const SMOOTH_PASSES = 2;
const PIN_SAMPLES = 12; // road height eases into the location pad over ~48 m

export type PlacedLocation = LocationDef & { y: number };

export type RoadPath = {
  id: string;
  from: LocationId;
  to: LocationId;
  width: number;
  count: number;
  length: number;
  x: Float32Array;
  z: Float32Array;
  y: Float32Array; // graded centreline height
  dx: Float32Array; // unit tangent
  dz: Float32Array;
  dist: Float32Array; // cumulative distance along the road
};

export type RoadChunkRef = {
  key: string;
  path: RoadPath;
  from: number;
  to: number;
  cx: number;
  cz: number;
  r: number;
};

export type RoutePoint = { x: number; z: number };
export type Influence = { w: number; h: number };

export type RoadNetwork = {
  locations: ReadonlyMap<LocationId, PlacedLocation>;
  paths: readonly RoadPath[];
  chunksNear(x: number, z: number, radius: number): RoadChunkRef[];
  locationsNear(x: number, z: number, radius: number): PlacedLocation[];
  /** Distance to the nearest road centreline; Infinity beyond ~32 m. */
  distanceToRoad(x: number, z: number): number;
  /** Blend weight + target height that grading pulls the terrain toward. */
  influence(x: number, z: number, out: Influence): boolean;
  /** Waypoints along roads between two locations (multi-road via BFS). */
  route(
    from: LocationId,
    to: LocationId,
    everyMetres?: number,
  ): RoutePoint[] | null;
};

// ── helpers ────────────────────────────────────────────────────────────
const hash = (x: number, z: number) => {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function smoothNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1; // -1..1
}
const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 *
  (2 * p1 +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const smoothstep01 = (u: number) => {
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
};

function resample(
  dense: [number, number][],
  spacing: number,
): [number, number][] {
  const out: [number, number][] = [dense[0]];
  let need = spacing;
  for (let i = 1; i < dense.length; i++) {
    let [ax, az] = dense[i - 1];
    const [bx, bz] = dense[i];
    let segLen = Math.hypot(bx - ax, bz - az);
    while (segLen >= need) {
      const t = need / segLen;
      ax += (bx - ax) * t;
      az += (bz - az) * t;
      out.push([ax, az]);
      segLen -= need;
      need = spacing;
    }
    need -= segLen;
  }
  const last = dense[dense.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > 0.5) out.push(last);
  return out;
}

function smoothHeights(src: Float32Array, radius: number, passes: number) {
  let cur = src;
  const n = src.length;
  for (let p = 0; p < passes; p++) {
    const dst = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++)
        sum += cur[Math.min(n - 1, Math.max(0, i + k))];
      dst[i] = sum / (2 * radius + 1);
    }
    cur = dst;
  }
  return cur;
}

type OrientedRoad = {
  def: RoadDef;
  from: LocationId;
  to: LocationId;
  via: readonly (readonly [number, number])[];
};

function orientRoad(road: RoadDef, from: LocationId): OrientedRoad {
  const forward = road.from === from;
  return {
    def: road,
    from,
    to: forward ? road.to : road.from,
    via: forward ? (road.via ?? []) : [...(road.via ?? [])].reverse(),
  };
}

function buildChains(roads: readonly RoadDef[]): OrientedRoad[][] {
  const degree = new Map<LocationId, number>();
  for (const road of roads) {
    degree.set(road.from, (degree.get(road.from) ?? 0) + 1);
    degree.set(road.to, (degree.get(road.to) ?? 0) + 1);
  }
  const used = new Set<number>();
  const chains: OrientedRoad[][] = [];
  for (let index = 0; index < roads.length; index++) {
    if (used.has(index)) continue;
    const first = roads[index];
    let current: LocationId =
      (degree.get(first.from) ?? 0) === 2 ? first.to : first.from;
    const chain: OrientedRoad[] = [];
    for (;;) {
      const nextIndex = roads.findIndex(
        (road, i) =>
          !used.has(i) && (road.from === current || road.to === current),
      );
      if (nextIndex < 0) break;
      const road = orientRoad(roads[nextIndex], current);
      used.add(nextIndex);
      chain.push(road);
      current = road.to;
      if ((degree.get(current) ?? 0) !== 2) break;
    }
    if (chain.length > 0) chains.push(chain);
  }
  return chains;
}

function buildChainPaths(
  chain: readonly OrientedRoad[],
  locations: ReadonlyMap<LocationId, PlacedLocation>,
  base: TerrainSampler,
): RoadPath[] {
  const ctrl: [number, number][] = [];
  const boundaries: [number, number][] = [];
  for (const road of chain) {
    const a = locations.get(road.from);
    const b = locations.get(road.to);
    if (!a || !b) throw new Error(`Road ${road.def.id}: unknown location`);
    const anchors: [number, number][] = [
      [a.x, a.z],
      ...road.via.map(([x, z]): [number, number] => [x, z]),
      [b.x, b.z],
    ];
    const wobble = road.def.wobble ?? 60;
    for (let s = 0; s < anchors.length - 1; s++) {
      const [x0, z0] = anchors[s];
      const [x1, z1] = anchors[s + 1];
      const dx = x1 - x0;
      const dz = z1 - z0;
      const len = Math.hypot(dx, dz);
      const nx = -dz / len;
      const nz = dx / len;
      const n = Math.max(1, Math.round(len / CONTROL_SPACING));
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const x = x0 + dx * t;
        const z = z0 + dz * t;
        const off =
          smoothNoise(x * 0.004, z * 0.004) * wobble * Math.sin(Math.PI * t);
        ctrl.push([x + nx * off, z + nz * off]);
      }
    }
    boundaries.push([b.x, b.z]);
  }
  const endLocation = locations.get(chain[chain.length - 1].to)!;
  ctrl.push([endLocation.x, endLocation.z]);

  const dense: [number, number][] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(i - 1, 0)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(i + 2, ctrl.length - 1)];
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      dense.push([
        catmull(p0[0], p1[0], p2[0], p3[0], t),
        catmull(p0[1], p1[1], p2[1], p3[1], t),
      ]);
    }
  }
  dense.push(ctrl[ctrl.length - 1]);

  const pts = resample(dense, SAMPLE_SPACING);
  const n = pts.length;
  const boundaryIndices: number[] = [];
  let cursor = 0;
  for (let b = 0; b < boundaries.length; b++) {
    const [bx, bz] = boundaries[b];
    const remaining = boundaries.length - 1 - b;
    const minIndex = Math.min(n - 1, cursor + 1);
    const maxIndex = Math.max(minIndex, n - 1 - remaining);
    let best = minIndex;
    let bestD2 = Infinity;
    for (let i = minIndex; i <= maxIndex; i++) {
      const dx = pts[i][0] - bx;
      const dz = pts[i][1] - bz;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = i;
      }
    }
    boundaryIndices.push(best);
    cursor = best;
  }

  const x = new Float32Array(n);
  const z = new Float32Array(n);
  const rawY = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = pts[i][0];
    z[i] = pts[i][1];
    rawY[i] = base.getHeight(x[i], z[i]);
  }

  const y = smoothHeights(rawY, SMOOTH_RADIUS, SMOOTH_PASSES);
  const pin = (center: number, target: number, radius: number) => {
    const k = Math.min(radius, center, n - 1 - center);
    for (let d = 0; d <= k; d++) {
      const f = 1 - d / (k + 1);
      const left = center - d;
      const right = center + d;
      y[left] += (target - y[left]) * f;
      if (d > 0) y[right] += (target - y[right]) * f;
    }
  };
  const startLocation = locations.get(chain[0].from)!;
  const endK = Math.min(PIN_SAMPLES, n >> 1);
  for (let k = 0; k < endK; k++) {
    const f = k / endK;
    y[k] = startLocation.y + (y[k] - startLocation.y) * f;
    y[n - 1 - k] = endLocation.y + (y[n - 1 - k] - endLocation.y) * f;
  }
  for (let b = 0; b < boundaries.length - 1; b++) {
    const location = locations.get(chain[b].to)!;
    pin(boundaryIndices[b], location.y, PIN_SAMPLES);
  }

  const dx = new Float32Array(n);
  const dz = new Float32Array(n);
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = Math.max(i - 1, 0);
    const q = Math.min(i + 1, n - 1);
    const tx = x[q] - x[p];
    const tz = z[q] - z[p];
    const l = Math.hypot(tx, tz) || 1;
    dx[i] = tx / l;
    dz[i] = tz / l;
    if (i > 0)
      dist[i] = dist[i - 1] + Math.hypot(x[i] - x[i - 1], z[i] - z[i - 1]);
  }

  return chain.map((road, index) => {
    const start = index === 0 ? 0 : boundaryIndices[index - 1];
    const end = Math.min(n - 1, Math.max(boundaryIndices[index], start + 1));
    const count = end - start + 1;
    const roadDist = dist.slice(start, end + 1);
    return {
      id: road.def.id,
      from: road.from,
      to: road.to,
      width: road.def.width ?? 8,
      count,
      length: roadDist[count - 1] - roadDist[0],
      x: x.slice(start, end + 1),
      z: z.slice(start, end + 1),
      y: y.slice(start, end + 1),
      dx: dx.slice(start, end + 1),
      dz: dz.slice(start, end + 1),
      dist: roadDist,
    };
  });
}

// ── network ────────────────────────────────────────────────────────────
export function createRoadNetwork(
  world: WorldDef,
  base: TerrainSampler,
): RoadNetwork {
  const locations = new Map<LocationId, PlacedLocation>(
    world.locations.map((l) => [l.id, { ...l, y: base.getHeight(l.x, l.z) }]),
  );
  const locArr = [...locations.values()];

  const paths = buildChains(world.roads).flatMap((chain) =>
    buildChainPaths(chain, locations, base),
  );

  // chunk descriptors for streaming
  const chunks: RoadChunkRef[] = [];
  for (const path of paths) {
    for (let s = 0; s < path.count - 1; s += CHUNK_SAMPLES) {
      const to = Math.min(s + CHUNK_SAMPLES, path.count - 1);
      const mid = (s + to) >> 1;
      const cx = path.x[mid];
      const cz = path.z[mid];
      let r = 0;
      for (let i = s; i <= to; i++)
        r = Math.max(r, Math.hypot(path.x[i] - cx, path.z[i] - cz));
      chunks.push({
        key: `${path.id}:${s}`,
        path,
        from: s,
        to,
        cx,
        cz,
        r: r + path.width,
      });
    }
  }

  // spatial hash of road samples (flat [pathIdx, sampleIdx, ...] pairs per cell)
  const cellKey = (cx: number, cz: number) =>
    (cx + 32768) * 65536 + (cz + 32768);
  const grid = new Map<number, number[]>();
  paths.forEach((p, pi) => {
    for (let si = 0; si < p.count; si++) {
      const k = cellKey(Math.floor(p.x[si] / CELL), Math.floor(p.z[si] / CELL));
      let list = grid.get(k);
      if (!list) grid.set(k, (list = []));
      list.push(pi, si);
    }
  });

  // per-call scratch (getHeight is hot; avoid allocations)
  const stamp = new Int32Array(paths.length);
  const bestD2 = new Float64Array(paths.length);
  const bestS = new Int32Array(paths.length);
  const touched = new Int32Array(paths.length);
  let callId = 0;
  const proj = { d: 0, h: 0 };

  function scan(x: number, z: number): number {
    callId++;
    let count = 0;
    const cx = Math.floor(x / CELL);
    const cz = Math.floor(z / CELL);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const list = grid.get(cellKey(cx + i, cz + j));
        if (!list) continue;
        for (let k = 0; k < list.length; k += 2) {
          const pi = list[k];
          const si = list[k + 1];
          const p = paths[pi];
          const ex = p.x[si] - x;
          const ez = p.z[si] - z;
          const d2 = ex * ex + ez * ez;
          if (stamp[pi] !== callId) {
            stamp[pi] = callId;
            bestD2[pi] = d2;
            bestS[pi] = si;
            touched[count++] = pi;
          } else if (d2 < bestD2[pi]) {
            bestD2[pi] = d2;
            bestS[pi] = si;
          }
        }
      }
    }
    return count;
  }

  // exact distance to the centreline + interpolated height (avoids stair-steps)
  function project(p: RoadPath, si: number, x: number, z: number) {
    let bd = Infinity;
    let bh = p.y[si];
    for (let a = si - 1; a <= si; a++) {
      if (a < 0 || a + 1 >= p.count) continue;
      const ax = p.x[a];
      const az = p.z[a];
      const vx = p.x[a + 1] - ax;
      const vz = p.z[a + 1] - az;
      const len2 = vx * vx + vz * vz || 1;
      let t = ((x - ax) * vx + (z - az) * vz) / len2;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = Math.hypot(x - (ax + vx * t), z - (az + vz * t));
      if (d < bd) {
        bd = d;
        bh = p.y[a] + (p.y[a + 1] - p.y[a]) * t;
      }
    }
    proj.d = bd;
    proj.h = bh;
  }

  const influence = (x: number, z: number, out: Influence) => {
    let wSum = 0;
    let wMax = 0;
    let tSum = 0;

    const n = scan(x, z);
    for (let t = 0; t < n; t++) {
      const pi = touched[t];
      const p = paths[pi];
      project(p, bestS[pi], x, z);
      const half = p.width / 2;
      const w =
        proj.d <= half ? 1 : 1 - smoothstep01((proj.d - half) / SHOULDER);
      if (w <= 0) continue;
      wSum += w;
      tSum += w * proj.h;
      if (w > wMax) wMax = w;
    }
    for (const loc of locArr) {
      const ex = x - loc.x;
      const ez = z - loc.z;
      const reach = loc.padRadius + PAD_SHOULDER;
      const d2 = ex * ex + ez * ez;
      if (d2 >= reach * reach) continue;
      const d = Math.sqrt(d2);
      const w =
        d <= loc.padRadius
          ? 1
          : 1 - smoothstep01((d - loc.padRadius) / PAD_SHOULDER);
      wSum += w;
      tSum += w * loc.y;
      if (w > wMax) wMax = w;
    }
    if (wSum <= 0) return false;
    out.w = wMax;
    out.h = tSum / wSum;
    return true;
  };

  // location graph for multi-road routes
  type Edge = { path: RoadPath; to: LocationId; reversed: boolean };
  const adj = new Map<LocationId, Edge[]>();
  for (const p of paths) {
    (adj.get(p.from) ?? adj.set(p.from, []).get(p.from)!).push({
      path: p,
      to: p.to,
      reversed: false,
    });
    (adj.get(p.to) ?? adj.set(p.to, []).get(p.to)!).push({
      path: p,
      to: p.from,
      reversed: true,
    });
  }

  return {
    locations,
    paths,
    chunksNear(x, z, radius) {
      return chunks.filter((c) => {
        const r = radius + c.r;
        const dx = c.cx - x;
        const dz = c.cz - z;
        return dx * dx + dz * dz < r * r;
      });
    },
    locationsNear(x, z, radius) {
      return locArr.filter(
        (l) => Math.hypot(l.x - x, l.z - z) < radius + l.padRadius,
      );
    },
    distanceToRoad(x, z) {
      const n = scan(x, z);
      let best = Infinity;
      for (let t = 0; t < n; t++) {
        const pi = touched[t];
        project(paths[pi], bestS[pi], x, z);
        if (proj.d < best) best = proj.d;
      }
      return best;
    },
    influence,
    route(from, to, everyMetres = 10) {
      if (!locations.has(from) || !locations.has(to)) return null;
      const prev = new Map<LocationId, { via: LocationId; edge: Edge } | null>([
        [from, null],
      ]);
      const queue: LocationId[] = [from];
      while (queue.length && !prev.has(to)) {
        const cur = queue.shift()!;
        for (const e of adj.get(cur) ?? []) {
          if (prev.has(e.to)) continue;
          prev.set(e.to, { via: cur, edge: e });
          queue.push(e.to);
        }
      }
      if (!prev.has(to)) return null;

      const edges: Edge[] = [];
      for (let at: LocationId = to; ;) {
        const step = prev.get(at);
        if (!step) break;
        edges.unshift(step.edge);
        at = step.via;
      }

      const out: RoutePoint[] = [];
      const stride = Math.max(1, Math.round(everyMetres / SAMPLE_SPACING));
      for (const { path, reversed } of edges) {
        const idx: number[] = [];
        for (let i = 0; i < path.count; i += stride) idx.push(i);
        if (idx[idx.length - 1] !== path.count - 1) idx.push(path.count - 1);
        if (reversed) idx.reverse();
        idx.forEach((i, k) => {
          if (out.length && k === 0) return; // shared junction point
          out.push({ x: path.x[i], z: path.z[i] });
        });
      }
      return out;
    },
  };
}

/** Terrain that flattens under roads and location pads. */
export function gradeTerrain(
  base: TerrainSampler,
  net: RoadNetwork,
): TerrainSampler {
  const out: Influence = { w: 0, h: 0 };
  // prototype delegation: any other sampler methods stay available and, if they
  // call this.getHeight, they see the graded height too
  const graded = Object.create(base) as TerrainSampler;
  (graded as { getHeight: TerrainSampler["getHeight"] }).getHeight = (x, z) => {
    const h = base.getHeight(x, z);
    if (!net.influence(x, z, out)) return h; // most of the world exits here
    return h + (out.h - h) * out.w;
  };
  return graded;
}
