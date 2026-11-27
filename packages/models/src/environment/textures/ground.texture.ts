import * as THREE from "three";

function hash2(x: number, y: number, seed: number): number {
  let h =
    Math.imul(x | 0, 374761393) +
    Math.imul(y | 0, 668265263) +
    Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x),
    yi = Math.floor(y);
  const xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed),
    b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed),
    d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, octaves = 5, seed = 0): number {
  let sum = 0,
    amp = 0.5,
    freq = 1,
    norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * smoothNoise(x * freq, y * freq, seed + i * 101);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeLayerCanvas(
  size: number,
  freq: number,
  seed: number,
  stops: [number, string][], // [t, hex] color ramp
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const rgbStops = stops.map(([t, h]) => [t, hexToRgb(h)] as const);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm((x / size) * freq, (y / size) * freq, 5, seed);
      let lo = rgbStops[0],
        hi = rgbStops[rgbStops.length - 1];
      for (let s = 0; s < rgbStops.length - 1; s++) {
        if (n >= rgbStops[s][0] && n <= rgbStops[s + 1][0]) {
          lo = rgbStops[s];
          hi = rgbStops[s + 1];
          break;
        }
      }
      const t = (n - lo[0]) / Math.max(1e-6, hi[0] - lo[0]);
      const i = (y * size + x) * 4;
      img.data[i] = lo[1][0] + (hi[1][0] - lo[1][0]) * t;
      img.data[i + 1] = lo[1][1] + (hi[1][1] - lo[1][1]) * t;
      img.data[i + 2] = lo[1][2] + (hi[1][2] - lo[1][2]) * t;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export type GroundLayers = {
  grass: THREE.CanvasTexture;
  dirt: THREE.CanvasTexture;
  rock: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
};

function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cache: GroundLayers | null = null;

export function getGroundLayers(): GroundLayers {
  if (cache) return cache;
  const grass = toTexture(
    makeLayerCanvas(256, 6, 7, [
      [0.35, "#5d6a38"],
      [0.65, "#7d8349"],
      [0.85, "#8f8f55"],
    ]),
  );
  grass.colorSpace = THREE.SRGBColorSpace;
  const dirt = toTexture(
    makeLayerCanvas(256, 5, 23, [
      [0.3, "#77603f"],
      [0.7, "#94805c"],
      [0.9, "#a5926b"],
    ]),
  );
  dirt.colorSpace = THREE.SRGBColorSpace;
  const rock = toTexture(
    makeLayerCanvas(256, 10, 41, [
      [0.3, "#626266"],
      [0.7, "#7e7e82"],
      [0.9, "#99999c"],
    ]),
  );
  rock.colorSpace = THREE.SRGBColorSpace;
  const rough = toTexture(
    makeLayerCanvas(256, 4, 59, [
      [0, "#d9d9d9"],
      [1, "#f2f2f2"],
    ]),
  );
  cache = { grass, dirt, rock, roughness: rough };
  return cache;
}
