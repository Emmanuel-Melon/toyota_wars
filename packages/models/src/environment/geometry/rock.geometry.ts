// packages/models/src/environment/geometry/rock.geometry.ts
import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const perlin = new ImprovedNoise();
export const ROCK_VARIANTS = 8;
export const ROCK_BASE_Y = -0.45;

export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fbm(x: number, y: number, z: number, octaves: number) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin.noise(x * freq, y * freq, z * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

const DARK = new THREE.Color("#5a4a38");
const BASE = new THREE.Color("#8c7556");
const SAND = new THREE.Color("#c9ae82");

function build(variant: number) {
  const rand = mulberry32(variant * 9973 + 17);
  const off = rand() * 100;

  let geo: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 5);
  geo.deleteAttribute("normal");
  geo.deleteAttribute("uv");
  geo = mergeVertices(geo);

  const sx = 0.9 + rand() * 0.5;
  const sy = 0.65 + rand() * 0.45;
  const sz = 0.9 + rand() * 0.5;

  const planes = Array.from({ length: 4 + Math.floor(rand() * 4) }, () => ({
    n: new THREE.Vector3(
      rand() * 2 - 1,
      rand() * 1.2 - 0.5,
      rand() * 2 - 1,
    ).normalize(),
    d: 0.5 + rand() * 0.3,
  }));

  const pos = geo.attributes.position;
  const detail = new Float32Array(pos.count);
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    v.multiplyScalar(
      1 + fbm(v.x * 0.9 + off, v.y * 0.9 + off, v.z * 0.9 + off, 2) * 0.5,
    );
    v.set(v.x * sx, v.y * sy, v.z * sz);

    for (const { n, d } of planes) {
      const excess = v.dot(n) - d;
      if (excess > 0) v.addScaledVector(n, -excess * 0.92);
    }

    const dn = fbm(v.x * 3.2 + off, v.y * 3.2 + off, v.z * 3.2 + off, 3);
    const ridge = 1 - Math.abs(perlin.noise(v.x * 5 + off, v.y * 5, v.z * 5));
    v.multiplyScalar(1 + dn * 0.08 + (ridge - 0.5) * 0.05);
    detail[i] = dn;

    const ledge = 1 + 0.025 * Math.sin(v.y * 11 + dn * 4);
    v.x *= ledge;
    v.z *= ledge;

    if (v.y < ROCK_BASE_Y) v.y = ROCK_BASE_Y + (v.y - ROCK_BASE_Y) * 0.05;

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const nrm = geo.attributes.normal;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const band = 0.5 + 0.5 * Math.sin(y * 9 + detail[i] * 2.5);
    c.copy(DARK).lerp(BASE, 0.35 + band * 0.65);
    c.lerp(SAND, Math.max(0, nrm.getY(i) - 0.35) * 0.5);
    c.multiplyScalar(0.82 + detail[i] * 0.5);
    c.multiplyScalar(
      0.7 +
        0.3 * THREE.MathUtils.smoothstep(y, ROCK_BASE_Y, ROCK_BASE_Y + 0.35),
    );
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeBoundingSphere();
  return geo;
}

const cache = new Map<number, THREE.BufferGeometry>();

export function getRockGeometry(variant: number) {
  let geometry = cache.get(variant);
  if (!geometry) {
    geometry = build(variant);
    cache.set(variant, geometry);
  }
  return geometry;
}
