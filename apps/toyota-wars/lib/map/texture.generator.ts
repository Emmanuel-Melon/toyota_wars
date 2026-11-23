// lib/map/texture.generator.ts
import * as THREE from "three";

function createNoiseCanvas(
  width: number,
  height: number,
  baseColor: string,
  speckleColor: string,
  density: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Add grit/speckle noise for organic terrain feel
    ctx.fillStyle = speckleColor;
    const numSpeckles = width * height * density;
    for (let i = 0; i < numSpeckles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      ctx.globalAlpha = Math.random() * 0.3 + 0.1;
      ctx.fillRect(x, y, size, size);
    }
  }

  return canvas;
}

export function createProceduralGroundTextures(): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  // 1. Diffuse / Color Texture (Arid desert/earth tone with darker grit)
  const colorCanvas = createNoiseCanvas(256, 256, "#a48c5b", "#6e5b38", 0.15);
  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  // 2. Roughness Texture (Varied roughness for matte dirt vs hard packed earth)
  const roughCanvas = createNoiseCanvas(256, 256, "#cccccc", "#555555", 0.08);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  return { colorMap, roughnessMap };
}

const groundTextureCache = new Map<
  number,
  ReturnType<typeof createProceduralGroundTextures>
>();

export function getProceduralGroundTextures(
  repeatScale = 1,
): ReturnType<typeof createProceduralGroundTextures> {
  const cached = groundTextureCache.get(repeatScale);
  if (cached) return cached;

  const textures = createProceduralGroundTextures();
  textures.colorMap.repeat.set(repeatScale, repeatScale);
  textures.roughnessMap.repeat.set(repeatScale, repeatScale);
  groundTextureCache.set(repeatScale, textures);
  return textures;
}
