import * as THREE from "three";

const TEXTURE_SIZE = 256;
const ROAD_SEED = 0x51a7d0f3;
const RUT_CENTERS = [0.27, 0.73] as const;

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawWrappedRect(
  ctx: CanvasRenderingContext2D,
  size: number,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const wrappedX = ((x % size) + size) % size;
  const wrappedY = ((y % size) + size) % size;

  for (const offsetX of [-size, 0, size]) {
    for (const offsetY of [-size, 0, size]) {
      const drawX = wrappedX + offsetX;
      const drawY = wrappedY + offsetY;
      if (
        drawX + width >= 0 &&
        drawX <= size &&
        drawY + height >= 0 &&
        drawY <= size
      ) {
        ctx.fillRect(drawX, drawY, width, height);
      }
    }
  }
}

function createRoadCanvas(roughness: boolean): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = roughness ? "#d8d8d8" : "#6b6357";
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);

  const rutWidth = TEXTURE_SIZE * 0.075;
  for (const center of RUT_CENTERS) {
    const x = center * TEXTURE_SIZE;
    const gradient = ctx.createLinearGradient(x - rutWidth, 0, x + rutWidth, 0);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(
      0.5,
      roughness ? "rgba(60, 60, 60, 0.12)" : "rgba(48, 42, 34, 0.28)",
    );
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - rutWidth, 0, rutWidth * 2, TEXTURE_SIZE);
  }

  const random = mulberry32(ROAD_SEED);
  const count = Math.floor(
    TEXTURE_SIZE * TEXTURE_SIZE * (roughness ? 0.12 : 0.22),
  );

  for (let index = 0; index < count; index += 1) {
    const x = random() * TEXTURE_SIZE;
    const y = random() * TEXTURE_SIZE;
    const light = random() > 0.56;
    const alpha = 0.08 + random() * 0.26;
    const width = 0.6 + random() * 2.1;
    const height = 0.6 + random() * 1.7;

    if (roughness) {
      ctx.fillStyle = light ? "#f2f2f2" : "#a8a8a8";
    } else {
      ctx.fillStyle = light ? "#9a8f7a" : "#3d382f";
    }
    ctx.globalAlpha = alpha;
    drawWrappedRect(ctx, TEXTURE_SIZE, x, y, width, height);
  }

  ctx.globalAlpha = 1;
  return canvas;
}

function createTexture(
  canvas: HTMLCanvasElement,
  isColor: boolean,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  if (isColor) texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function createProceduralRoadTextures(): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  return {
    colorMap: createTexture(createRoadCanvas(false), true),
    roughnessMap: createTexture(createRoadCanvas(true), false),
  };
}
