import * as THREE from "three";
import type { VehiclePalette } from "../types";

function mulberry32(seed: number): () => number {
  let state = Math.floor(seed * 0xffffffff) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(color: string, target: string, amount: number): string {
  return new THREE.Color(color)
    .lerp(new THREE.Color(target), amount)
    .getStyle();
}

export function createVehiclePaintPattern(
  palette: VehiclePalette,
  seed: number,
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (context) {
    const random = mulberry32(seed);
    const colors = [
      palette.cabin,
      shade(palette.body, palette.accent, 0.42),
      shade(palette.body, "#ffffff", 0.16),
    ];

    context.fillStyle = palette.body;
    context.fillRect(0, 0, size, size);

    for (let blob = 0; blob < 28; blob++) {
      const centerX = random() * size;
      const centerY = random() * size;
      const radius = size * (0.045 + random() * 0.085);
      const vertexCount = 7 + Math.floor(random() * 4);
      const vertices: { x: number; y: number }[] = [];

      for (let index = 0; index < vertexCount; index++) {
        const angle = (index / vertexCount) * Math.PI * 2;
        const jitter = 0.65 + random() * 0.6;
        vertices.push({
          x: Math.cos(angle) * radius * jitter,
          y: Math.sin(angle) * radius * jitter,
        });
      }

      context.fillStyle = colors[blob % colors.length];
      for (const offsetX of [-size, 0, size]) {
        for (const offsetY of [-size, 0, size]) {
          context.beginPath();
          vertices.forEach((vertex, index) => {
            const x = centerX + vertex.x + offsetX;
            const y = centerY + vertex.y + offsetY;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          });
          context.closePath();
          context.fill();
        }
      }
    }

    for (let index = 0; index < 900; index++) {
      const bright = random() > 0.55;
      context.fillStyle = bright
        ? "rgba(255, 240, 210, 0.10)"
        : "rgba(20, 18, 14, 0.12)";
      const speckle = 0.5 + random() * 1.4;
      context.fillRect(random() * size, random() * size, speckle, speckle);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}
