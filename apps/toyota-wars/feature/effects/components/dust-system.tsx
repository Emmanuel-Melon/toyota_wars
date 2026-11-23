// feature/effects/dust-system.tsx
"use client";

import { createContext, useContext } from "react";
import * as THREE from "three";

const MAX = 800;

export type DustPuff = {
  origin: THREE.Vector3;
  dir?: THREE.Vector3;
  count: number;
  speed?: number;
  spread?: number;
  lift?: number;
  size?: number;
  life?: number;
};

class DustPool {
  pos = new Float32Array(MAX * 3);
  vel = new Float32Array(MAX * 3);
  age = new Float32Array(MAX);
  life = new Float32Array(MAX); // 0 = dead
  size0 = new Float32Array(MAX);
  size = new Float32Array(MAX);
  alpha = new Float32Array(MAX);
  cursor = 0;
  geometry = new THREE.BufferGeometry();
  material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color("#b49a74") },
      uScale: { value: 600 },
    },
    vertexShader: /* glsl */ `
      attribute float aSize; attribute float aAlpha; varying float vAlpha;
      uniform float uScale;
      void main() {
        vAlpha = aAlpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale / max(-mv.z, 0.1);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
      }`,
  });

  constructor() {
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.pos, 3),
    );
    this.geometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(this.size, 1),
    );
    this.geometry.setAttribute(
      "aAlpha",
      new THREE.BufferAttribute(this.alpha, 1),
    );
  }

  emit(p: DustPuff) {
    const {
      origin,
      dir,
      count,
      speed = 2,
      spread = 1,
      lift = 1,
      size = 1,
      life = 1,
    } = p;
    for (let n = 0; n < count; n++) {
      const i = this.cursor++ % MAX;
      const k = i * 3;
      const f = 0.3 + Math.random() * 0.7;
      this.pos[k] = origin.x + (Math.random() - 0.5) * 0.4;
      this.pos[k + 1] = origin.y;
      this.pos[k + 2] = origin.z + (Math.random() - 0.5) * 0.4;
      this.vel[k] =
        (dir?.x ?? 0) * speed * f + (Math.random() - 0.5) * spread * 2;
      this.vel[k + 1] = (dir?.y ?? 0) * speed * f + Math.random() * lift;
      this.vel[k + 2] =
        (dir?.z ?? 0) * speed * f + (Math.random() - 0.5) * spread * 2;
      this.age[i] = 0;
      this.life[i] = life * (0.7 + Math.random() * 0.6);
      this.size0[i] = size * (0.6 + Math.random() * 0.8);
    }
  }

  update(dt: number) {
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) continue;
      this.age[i] += dt;
      const t = this.age[i] / this.life[i];
      if (t >= 1) {
        this.life[i] = 0;
        this.alpha[i] = 0;
        this.size[i] = 0;
        continue;
      }
      const k = i * 3;
      const drag = Math.exp(-2.2 * dt);
      this.vel[k] *= drag;
      this.vel[k + 1] = this.vel[k + 1] * drag + 0.25 * dt; // dust drifts up
      this.vel[k + 2] *= drag;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      this.size[i] = this.size0[i] * (1 + t * 2.2); // expands as it thins out
      this.alpha[i] = 0.5 * (1 - t) ** 1.6 * Math.min(1, this.age[i] / 0.05);
    }
    const g = this.geometry.attributes;
    g.position.needsUpdate = true;
    g.aSize.needsUpdate = true;
    g.aAlpha.needsUpdate = true;
  }
}

const DustContext = createContext<{ emit: (p: DustPuff) => void }>({
  emit: () => {},
});
export const useDust = () => useContext(DustContext);
