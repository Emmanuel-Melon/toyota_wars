import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getVehicleNumberTexture(value: string): THREE.CanvasTexture {
  const cached = textureCache.get(value);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "700 50px 'Arial Narrow', Impact, sans-serif";
    context.fillText(value, canvas.width / 2, canvas.height / 2 + 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  textureCache.set(value, texture);
  return texture;
}
