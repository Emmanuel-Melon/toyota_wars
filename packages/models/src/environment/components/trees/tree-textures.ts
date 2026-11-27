// packages/models/src/environment/components/trees/tree-textures.ts
import * as THREE from "three";

export type TreeTextures = {
  barkMap: THREE.CanvasTexture;
  barkBump: THREE.CanvasTexture;
  leafMap: THREE.CanvasTexture;
  leafAlpha: THREE.CanvasTexture;
};

function createRng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash2(x: number, y: number, seed: number): number {
  let h =
    (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 2246822519)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const wrap = (a: number, p: number) => ((a % p) + p) % p;

/** Value noise that tiles with integer periods px, py. */
function tileNoise(x: number, y: number, px: number, py: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(wrap(x0, px), wrap(y0, py), seed);
  const b = hash2(wrap(x0 + 1, px), wrap(y0, py), seed);
  const c = hash2(wrap(x0, px), wrap(y0 + 1, py), seed);
  const d = hash2(wrap(x0 + 1, px), wrap(y0 + 1, py), seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(u: number, v: number, px: number, py: number, seed: number, octaves = 4): number {
  let sum = 0;
  let amp = 0.5;
  let total = 0;
  for (let o = 0; o < octaves; o += 1) {
    const f = 2 ** o;
    sum += amp * tileNoise(u * px * f, v * py * f, px * f, py * f, seed + o);
    total += amp;
    amp *= 0.5;
  }
  return sum / total;
}

function makeCanvas(w: number, h: number) {
  if (typeof document === "undefined") {
    throw new Error("Tree textures need a DOM; render TreeField client-side only.");
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean, repeat: boolean) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

/** Vertical fissured bark: color + height (used as a bump map). Tiles in both axes. */
function createBark(seed: number) {
  const W = 128;
  const H = 256;
  const colorCanvas = makeCanvas(W, H);
  const heightCanvas = makeCanvas(W, H);
  const colorCtx = colorCanvas.getContext("2d")!;
  const heightCtx = heightCanvas.getContext("2d")!;
  const color = colorCtx.createImageData(W, H);
  const height = heightCtx.createImageData(W, H);

  const dark = new THREE.Color("#3a2c20");
  const light = new THREE.Color("#8d7358");
  const tint = new THREE.Color();

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const u = x / W;
      const v = y / H;
      const warp = (fbm(u, v, 3, 6, seed) - 0.5) * 0.25;
      const ridge = fbm(u + warp, v, 7, 2, seed + 10); // tall, thin features
      const fissure = 1 - Math.abs(ridge * 2 - 1);
      const grain = fbm(u, v, 24, 48, seed + 20, 2);
      const h = THREE.MathUtils.clamp(fissure ** 1.6 * 0.85 + grain * 0.15, 0, 1);
      const patch = fbm(u, v, 2, 3, seed + 30, 2); // low-frequency color drift

      tint.copy(dark).lerp(light, h * 0.8 + patch * 0.2);
      const i = (y * W + x) * 4;
      color.data[i] = tint.r * 255;
      color.data[i + 1] = tint.g * 255;
      color.data[i + 2] = tint.b * 255;
      color.data[i + 3] = 255;
      const g = h * 255;
      height.data[i] = height.data[i + 1] = height.data[i + 2] = g;
      height.data[i + 3] = 255;
    }
  }
  colorCtx.putImageData(color, 0, 0);
  heightCtx.putImageData(height, 0, 0);
  return { map: toTexture(colorCanvas, true, true), bump: toTexture(heightCanvas, false, true) };
}

/**
 * Feathery compound-leaf cluster. Drawn twice with the same seed: a color map
 * and a separate alpha map, so mipmapping never bleeds dark fringes into edges.
 */
function drawLeafCluster(ctx: CanvasRenderingContext2D, size: number, mode: "color" | "alpha") {
  const rand = createRng(77);
  ctx.fillStyle = mode === "alpha" ? "#000" : "#b4bb86";
  ctx.fillRect(0, 0, size, size);

  const stems = 7;
  const originX = size / 2;
  const originY = size * 0.93;

  for (let s = 0; s < stems; s += 1) {
    const angle = -Math.PI / 2 + (s / (stems - 1) - 0.5) * 2.3 + (rand() - 0.5) * 0.2;
    const length = size * (0.55 + rand() * 0.3);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    ctx.strokeStyle = mode === "alpha" ? "#fff" : "#6d6c3f";
    ctx.lineWidth = size * 0.01;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + dx * length, originY + dy * length);
    ctx.stroke();

    const pairs = 22;
    for (let k = 0; k < pairs; k += 1) {
      const t = 0.12 + (k / pairs) * 0.88;
      const px = originX + dx * length * t;
      const py = originY + dy * length * t;
      const leafLength = size * 0.075 * (1 - 0.45 * t);
      const leafWidth = leafLength * 0.38;

      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle + side * (0.85 + rand() * 0.35));
        ctx.fillStyle =
          mode === "alpha"
            ? "#fff"
            : `hsl(${68 + rand() * 28}, ${22 + rand() * 18}%, ${66 + rand() * 30}%)`;
        ctx.beginPath();
        ctx.ellipse(leafLength / 2, 0, leafLength / 2, leafWidth / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

function createLeaf() {
  const size = 256;
  const colorCanvas = makeCanvas(size, size);
  const alphaCanvas = makeCanvas(size, size);
  drawLeafCluster(colorCanvas.getContext("2d")!, size, "color");
  drawLeafCluster(alphaCanvas.getContext("2d")!, size, "alpha");
  return { map: toTexture(colorCanvas, true, false), alpha: toTexture(alphaCanvas, false, false) };
}

export function createTreeTextures(seed = 3): TreeTextures {
  const bark = createBark(seed);
  const leaf = createLeaf();
  return { barkMap: bark.map, barkBump: bark.bump, leafMap: leaf.map, leafAlpha: leaf.alpha };
}