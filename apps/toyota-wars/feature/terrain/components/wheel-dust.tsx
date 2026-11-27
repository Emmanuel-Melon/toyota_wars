// feature/terrain/components/wheel-dust.tsx
import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import type { WheelEmitter } from "../hooks/use-wheel-emitters";

const MAX = 800;

function makeSoftCircle(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.6, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function WheelDust({
  getEmitters,
  terrain,
}: {
  getEmitters: () => WheelEmitter[];
  terrain: TerrainSampler;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX * 3), 3),
    );
    g.setAttribute(
      "aSize",
      new THREE.BufferAttribute(new Float32Array(MAX), 1),
    );
    g.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(new Float32Array(MAX), 1),
    );
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    return g;
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
    const s = sim;

    // --- spawn ---
    let want = 0;
    const emitters = getEmitters();
    for (const e of emitters) want += e.speed * e.strength;
    s.spawnAcc += want * 6 * dt; // ~6 particles per m/s per second
    let n = Math.min(Math.floor(s.spawnAcc), 24);
    s.spawnAcc -= n;

    while (n-- > 0 && s.alive < MAX) {
      const e = emitters[(Math.random() * emitters.length) | 0];
      if (!e || e.strength <= 0) break;
      const i = s.alive++;
      const jx = (Math.random() - 0.5) * 0.6;
      const jz = (Math.random() - 0.5) * 0.6;
      s.pos[i * 3] = e.x + jx;
      s.pos[i * 3 + 1] = terrain.getHeight(e.x + jx, e.z + jz) + 0.15;
      s.pos[i * 3 + 2] = e.z + jz;
      s.vel[i * 3] = (Math.random() - 0.5) * 1.2 + e.dirX * e.speed * 0.25;
      s.vel[i * 3 + 1] = 0.9 + Math.random() * 1.1;
      s.vel[i * 3 + 2] = (Math.random() - 0.5) * 1.2 + e.dirZ * e.speed * 0.25;
      s.life[i] = 0;
      s.maxLife[i] = 0.9 + Math.random() * 0.9;
      s.baseSize[i] = 1.2 + Math.random() * 1.6;
    }

    // --- integrate + write attributes ---
    for (let i = 0; i < s.alive; i++) {
      s.life[i] += dt;
      if (s.life[i] >= s.maxLife[i]) {
        // swap-with-last compaction
        const l = --s.alive;
        for (let k = 0; k < 3; k++) {
          s.pos[i * 3 + k] = s.pos[l * 3 + k];
          s.vel[i * 3 + k] = s.vel[l * 3 + k];
        }
        s.life[i] = s.life[l];
        s.maxLife[i] = s.maxLife[l];
        s.baseSize[i] = s.baseSize[l];
        i--;
        continue;
      }
      const t = s.life[i] / s.maxLife[i];
      s.vel[i * 3] *= 1 - 1.4 * dt;
      s.vel[i * 3 + 1] *= 1 - 0.9 * dt;
      s.vel[i * 3 + 2] *= 1 - 1.4 * dt;
      s.pos[i * 3] += s.vel[i * 3] * dt;
      s.pos[i * 3 + 1] += s.vel[i * 3 + 1] * dt;
      s.pos[i * 3 + 2] += s.vel[i * 3 + 2] * dt;
      s.size[i] = s.baseSize[i] * (1 + t * 2.2); // expand
      s.alpha[i] = (1 - t) * (1 - t) * 0.4; // fast in, slow out
    }

    geometry.setDrawRange(0, s.alive);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aSize.needsUpdate = true;
    geometry.attributes.aAlpha.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      (material.uniforms.uMap.value as THREE.Texture).dispose();
    };
  }, [geometry, material]);

  return (
    <points
      geometry={geometry}
      material={material}
      renderOrder={2}
      frustumCulled={false}
    />
  );
}
