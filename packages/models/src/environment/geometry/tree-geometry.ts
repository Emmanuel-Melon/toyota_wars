// trees/tree-geometry.ts
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Vec3 = [number, number, number];
type Ellipsoid = { center: Vec3; radii: Vec3 };
type Cluster = Ellipsoid & { cards: number };

export type TreeGeometry = {
  trunk: THREE.BufferGeometry;
  canopy: THREE.BufferGeometry;
};

function createRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type TubeOptions = {
  points: Vec3[];
  radiusAt: (t: number) => number;
  tubular?: number;
  radial?: number;
  gnarl?: number;
  phase?: number;
  vPerUnit?: number; // bark texture repeats per world unit along the length
};

/** Tapered tube along a Catmull-Rom curve, with parallel-transport frames and bark wobble. */
function createTube({
  points,
  radiusAt,
  tubular = 12,
  radial = 7,
  gnarl = 0.05,
  phase = 0,
  vPerUnit = 0.45,
}: TubeOptions): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const length = curve.getLength();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const center = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const prevTangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const axis = new THREE.Vector3();

  for (let i = 0; i <= tubular; i += 1) {
    const t = i / tubular;
    curve.getPointAt(t, center);
    curve.getTangentAt(t, tangent);

    if (i === 0) {
      normal.set(Math.abs(tangent.x) > 0.9 ? 0 : 1, 0, Math.abs(tangent.x) > 0.9 ? 1 : 0);
      normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
    } else {
      axis.crossVectors(prevTangent, tangent);
      if (axis.lengthSq() > 1e-10) {
        const angle = Math.acos(THREE.MathUtils.clamp(prevTangent.dot(tangent), -1, 1));
        normal.applyAxisAngle(axis.normalize(), angle);
      }
    }
    prevTangent.copy(tangent);
    binormal.crossVectors(tangent, normal).normalize();

    const r = radiusAt(t);
    for (let j = 0; j <= radial; j += 1) {
      const a = (j / radial) * Math.PI * 2;
      const wobble =
        1 + gnarl * Math.sin(a * 3 + t * 6 + phase) + gnarl * 0.6 * Math.sin(a * 5 - t * 13 + phase * 1.7);
      const c = Math.cos(a) * r * wobble;
      const s = Math.sin(a) * r * wobble;
      positions.push(
        center.x + normal.x * c + binormal.x * s,
        center.y + normal.y * c + binormal.y * s,
        center.z + normal.z * c + binormal.z * s,
      );
      uvs.push(j / radial, t * length * vPerUnit);
    }
  }

  for (let i = 0; i < tubular; i += 1) {
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function mergeTubes(tubes: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(tubes, false);
  tubes.forEach((t) => t.dispose());
  if (!merged) throw new Error("Failed to merge trunk geometry");
  return merged;
}

/**
 * Leaf-cluster cards scattered through ellipsoids. Each card is emitted with both
 * windings so the material can stay single-sided and keep its custom normals.
 * Normals are bent toward a "dome" normal (soft volumetric lighting), and a baked
 * vertex color darkens the underside and interior.
 */
function createLeafCanopy(
  rand: () => number,
  clusters: readonly Cluster[],
  dome: Ellipsoid,
  { size, flatness }: { size: [number, number]; flatness: number },
): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const Y = new THREE.Vector3(0, 1, 0);
  const domeCenter = new THREE.Vector3(...dome.center);
  const domeRadii = new THREE.Vector3(...dome.radii);
  const p = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const n = new THREE.Vector3();
  const ref = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const corner = new THREE.Vector3();
  const local = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();
  const CORNERS = [
    [-1, -1, 0, 0],
    [1, -1, 1, 0],
    [1, 1, 1, 1],
    [-1, 1, 0, 1],
  ] as const;

  for (const cluster of clusters) {
    for (let i = 0; i < cluster.cards; i += 1) {
      dir.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
      dir.normalize();
      const r = Math.pow(rand(), 0.4); // bias toward the outer shell
      p.set(
        cluster.center[0] + dir.x * cluster.radii[0] * r,
        cluster.center[1] + dir.y * cluster.radii[1] * r,
        cluster.center[2] + dir.z * cluster.radii[2] * r,
      );

      // Card orientation: flatness 1 = all facing up (acacia pancakes), 0 = random
      n.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
        .normalize()
        .multiplyScalar(1 - flatness)
        .addScaledVector(Y, flatness)
        .normalize();
      const nearVertical = Math.abs(n.y) > 0.95;
      ref.set(nearVertical ? 1 : 0, nearVertical ? 0 : 1, 0);
      right.crossVectors(ref, n).normalize();
      up.crossVectors(n, right);

      const spin = rand() * Math.PI * 2;
      const cs = Math.cos(spin);
      const sn = Math.sin(spin);
      const rx = right.clone().multiplyScalar(cs).addScaledVector(up, sn);
      const ry = up.clone().multiplyScalar(cs).addScaledVector(right, -sn);
      const half = (size[0] + rand() * (size[1] - size[0])) / 2;

      const base = positions.length / 3;
      for (const [sx, sy, u, v] of CORNERS) {
        corner.copy(p).addScaledVector(rx, sx * half).addScaledVector(ry, sy * half);
        positions.push(corner.x, corner.y, corner.z);

        local.copy(corner).sub(domeCenter).divide(domeRadii); // ellipsoid space
        const outer = Math.min(1, local.length());
        const top = THREE.MathUtils.clamp((local.y + 1) / 2, 0, 1);
        vertexNormal.copy(local).normalize().multiplyScalar(0.8).addScaledVector(n, 0.2).normalize();
        normals.push(vertexNormal.x, vertexNormal.y, vertexNormal.z);

        const shade = 0.45 + 0.35 * top + 0.2 * outer;
        colors.push(shade, shade, shade);
        uvs.push(u, v);
      }
      indices.push(
        base, base + 1, base + 2, base, base + 2, base + 3, // front
        base, base + 2, base + 1, base, base + 3, base + 2, // back
      );
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** Umbrella acacia: leaning S-trunk, 3-4 arching limbs, flat layered canopy. */
export function createAcaciaGeometry(seed: number): TreeGeometry {
  const rand = createRng(seed);
  const lean = (rand() - 0.5) * 0.9;
  const forkY = 3.4 + rand() * 0.6;
  const fork: Vec3 = [lean, forkY, (rand() - 0.5) * 0.5];

  const tubes = [
    createTube({
      points: [[0, -0.15, 0], [lean * 0.25, 1.2, 0.05], [lean * 0.65, 2.4, -0.1], fork],
      radiusAt: (t) => 0.14 + 0.13 * (1 - t) + 0.22 * Math.exp(-t * 10), // taper + root flare
      tubular: 14,
      radial: 8,
      phase: rand() * 6,
    }),
  ];

  const clusters: Cluster[] = [];
  const limbCount = 3 + (rand() > 0.5 ? 1 : 0);
  for (let k = 0; k < limbCount; k += 1) {
    const angle = (k / limbCount) * Math.PI * 2 + rand() * 0.7;
    const reach = 1.8 + rand() * 0.9;
    const rise = 0.9 + rand() * 0.6;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const tip: Vec3 = [fork[0] + dx * reach, forkY + rise, fork[2] + dz * reach];
    const mid: Vec3 = [fork[0] + dx * reach * 0.4, forkY + rise * 0.75, fork[2] + dz * reach * 0.4];

    tubes.push(
      createTube({
        points: [[fork[0], forkY - 0.15, fork[2]], mid, tip],
        radiusAt: (t) => 0.12 - 0.07 * t,
        tubular: 8,
        radial: 6,
        gnarl: 0.06,
        phase: rand() * 6,
      }),
    );
    clusters.push({ center: [tip[0], tip[1] + 0.35, tip[2]], radii: [1.9, 0.38, 1.9], cards: 16 });
  }
  clusters.push({ center: [fork[0], forkY + 1.3, fork[2]], radii: [2.2, 0.4, 2.2], cards: 14 });

  return {
    trunk: mergeTubes(tubes),
    canopy: createLeafCanopy(
      rand,
      clusters,
      { center: [fork[0], forkY + 1.4, fork[2]], radii: [4.2, 1.1, 4.2] },
      { size: [1.5, 2.4], flatness: 0.8 },
    ),
  };
}

/** Rounder shade tree: short thick trunk, three spreading limbs, full dome canopy. */
export function createShadeTreeGeometry(seed: number): TreeGeometry {
  const rand = createRng(seed);
  const lean = (rand() - 0.5) * 0.5;
  const forkY = 2.2 + rand() * 0.4;
  const fork: Vec3 = [lean, forkY, 0];

  const tubes = [
    createTube({
      points: [[0, -0.15, 0], [lean * 0.3, 1.1, 0], fork],
      radiusAt: (t) => 0.2 + 0.12 * (1 - t) + 0.2 * Math.exp(-t * 9),
      tubular: 10,
      radial: 8,
      phase: rand() * 6,
    }),
  ];

  const clusters: Cluster[] = [];
  for (let k = 0; k < 3; k += 1) {
    const angle = (k / 3) * Math.PI * 2 + rand() * 0.8;
    const reach = 1.0 + rand() * 0.6;
    const rise = 1.1 + rand() * 0.6;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const tip: Vec3 = [fork[0] + dx * reach, forkY + rise, dz * reach];
    tubes.push(
      createTube({
        points: [[fork[0], forkY - 0.1, 0], [fork[0] + dx * reach * 0.4, forkY + rise * 0.7, dz * reach * 0.4], tip],
        radiusAt: (t) => 0.11 - 0.06 * t,
        tubular: 8,
        radial: 6,
        phase: rand() * 6,
      }),
    );
    clusters.push({ center: [tip[0], tip[1] + 0.6, tip[2]], radii: [1.6, 1.3, 1.6], cards: 22 });
  }
  clusters.push({ center: [lean, forkY + 2.2, 0], radii: [1.8, 1.3, 1.8], cards: 24 });

  return {
    trunk: mergeTubes(tubes),
    canopy: createLeafCanopy(
      rand,
      clusters,
      { center: [lean, forkY + 1.9, 0], radii: [3.1, 2.4, 3.1] },
      { size: [1.4, 2.2], flatness: 0.25 },
    ),
  };
}