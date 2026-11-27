import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TerrainSampler, WheelEmitter } from "../types";

const MAX = 800;

function makeSoftCircle(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.6, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export function WheelDust({
  getEmitters,
  terrain,
}: {
  getEmitters: () => WheelEmitter[];
  terrain: TerrainSampler;
}) {
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX * 3), 3),
    );
    buffer.setAttribute(
      "aSize",
      new THREE.BufferAttribute(new Float32Array(MAX), 1),
    );
    buffer.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(new Float32Array(MAX), 1),
    );
    buffer.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    return buffer;
  }, []);

  const sim = useMemo(
    () => ({
      pos: (geometry.attributes.position as THREE.BufferAttribute)
        .array as Float32Array,
      size: (geometry.attributes.aSize as THREE.BufferAttribute)
        .array as Float32Array,
      alpha: (geometry.attributes.aAlpha as THREE.BufferAttribute)
        .array as Float32Array,
      vel: new Float32Array(MAX * 3),
      life: new Float32Array(MAX),
      maxLife: new Float32Array(MAX),
      baseSize: new Float32Array(MAX),
      alive: 0,
      spawnAcc: 0,
    }),
    [geometry],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMap: { value: makeSoftCircle() },
          uColor: { value: new THREE.Color("#b3a17b") },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aAlpha;
          varying float vAlpha;
          void main() {
            vAlpha = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * (240.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform sampler2D uMap;
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float a = texture2D(uMap, gl_PointCoord).a * vAlpha;
            if (a < 0.01) discard;
            gl_FragColor = vec4(uColor, a);
          }`,
      }),
    [],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const state = sim;
    const emitters = getEmitters();

    let want = 0;
    for (const emitter of emitters) want += emitter.speed * emitter.strength;
    state.spawnAcc += want * 6 * dt;
    let count = Math.min(Math.floor(state.spawnAcc), 24);
    state.spawnAcc -= count;

    while (count-- > 0 && state.alive < MAX) {
      const emitter = emitters[(Math.random() * emitters.length) | 0];
      if (!emitter || emitter.strength <= 0) break;
      const index = state.alive++;
      const jitterX = (Math.random() - 0.5) * 0.6;
      const jitterZ = (Math.random() - 0.5) * 0.6;
      state.pos[index * 3] = emitter.x + jitterX;
      state.pos[index * 3 + 1] =
        terrain.getHeight(emitter.x + jitterX, emitter.z + jitterZ) + 0.15;
      state.pos[index * 3 + 2] = emitter.z + jitterZ;
      state.vel[index * 3] =
        (Math.random() - 0.5) * 1.2 + emitter.dirX * emitter.speed * 0.25;
      state.vel[index * 3 + 1] = 0.9 + Math.random() * 1.1;
      state.vel[index * 3 + 2] =
        (Math.random() - 0.5) * 1.2 + emitter.dirZ * emitter.speed * 0.25;
      state.life[index] = 0;
      state.maxLife[index] = 0.9 + Math.random() * 0.9;
      state.baseSize[index] = 1.2 + Math.random() * 1.6;
    }

    for (let index = 0; index < state.alive; index++) {
      state.life[index] += dt;
      if (state.life[index] >= state.maxLife[index]) {
        const last = --state.alive;
        for (let axis = 0; axis < 3; axis++) {
          state.pos[index * 3 + axis] = state.pos[last * 3 + axis];
          state.vel[index * 3 + axis] = state.vel[last * 3 + axis];
        }
        state.life[index] = state.life[last];
        state.maxLife[index] = state.maxLife[last];
        state.baseSize[index] = state.baseSize[last];
        index--;
        continue;
      }
      const t = state.life[index] / state.maxLife[index];
      state.vel[index * 3] *= 1 - 1.4 * dt;
      state.vel[index * 3 + 1] *= 1 - 0.9 * dt;
      state.vel[index * 3 + 2] *= 1 - 1.4 * dt;
      state.pos[index * 3] += state.vel[index * 3] * dt;
      state.pos[index * 3 + 1] += state.vel[index * 3 + 1] * dt;
      state.pos[index * 3 + 2] += state.vel[index * 3 + 2] * dt;
      state.size[index] = state.baseSize[index] * (1 + t * 2.2);
      state.alpha[index] = (1 - t) * (1 - t) * 0.4;
    }

    geometry.setDrawRange(0, state.alive);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
  });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      (material.uniforms.uMap.value as THREE.Texture).dispose();
    },
    [geometry, material],
  );

  return (
    <points
      geometry={geometry}
      material={material}
      renderOrder={2}
      frustumCulled={false}
    />
  );
}
