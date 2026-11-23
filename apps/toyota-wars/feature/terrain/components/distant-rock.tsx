// apps/toyota-wars/feature/terrain/components/distant-rock.tsx
"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import {
  ROCK_BASE_Y,
  ROCK_VARIANTS,
  getRockGeometry,
  mulberry32,
} from "@/lib/world/rock.geometry";

const rockMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.95,
  metalness: 0,
});

type DistantRockProps = {
  position: [number, number, number]; // y = ground height at this spot
  scale: number;
  seed?: number;
  solid?: boolean; // false = no collider (tiny or far-off rocks)
};

export function DistantRock({
  position,
  scale,
  seed = 1,
  solid = true,
}: DistantRockProps) {
  const s = Math.floor(seed);
  const variant = ((s % ROCK_VARIANTS) + ROCK_VARIANTS) % ROCK_VARIANTS;
  const geometry = useMemo(() => getRockGeometry(variant), [variant]);

  const { yaw, tilt, stretch } = useMemo(() => {
    const r = mulberry32(s * 7919 + 3);
    return {
      yaw: r() * Math.PI * 2,
      tilt: [(r() - 0.5) * 0.18, (r() - 0.5) * 0.18] as const, // flat base stays down
      stretch: [0.85 + r() * 0.35, 0.8 + r() * 0.4, 0.85 + r() * 0.35] as const,
    };
  }, [s]);

  const sy = scale * stretch[1];
  const sink = 0.2; // bury 20% of the height so it looks planted, not placed
  const y = position[1] - ROCK_BASE_Y * sy - sink * sy;

  return (
    <RigidBody
      type="fixed"
      colliders={solid ? "hull" : false}
      restitution={0.1}
      friction={0.9}
    >
      <mesh
        geometry={geometry}
        material={rockMaterial}
        position={[position[0], y, position[2]]}
        rotation={[tilt[0], yaw, tilt[1]]}
        scale={[scale * stretch[0], sy, scale * stretch[2]]}
        castShadow
        receiveShadow
      />
    </RigidBody>
  );
}

/** A big rock with a few small ones around it, which reads far more natural than lone boulders. */
export function RockCluster({
  position,
  scale,
  seed = 1,
  heightAt,
}: DistantRockProps & { heightAt?: (x: number, z: number) => number }) {
  const satellites = useMemo(() => {
    const r = mulberry32(Math.floor(seed) * 131 + 7);
    const n = 2 + Math.floor(r() * 3);
    return Array.from({ length: n }, (_, i) => {
      const a = r() * Math.PI * 2;
      const d = scale * (0.9 + r() * 1.2);
      const x = position[0] + Math.cos(a) * d;
      const z = position[2] + Math.sin(a) * d;
      return {
        pos: [x, heightAt?.(x, z) ?? position[1], z] as [
          number,
          number,
          number,
        ],
        scale: scale * (0.25 + r() * 0.35),
        seed: Math.floor(seed) * 10 + i + 1,
      };
    });
  }, [position, scale, seed, heightAt]);

  return (
    <>
      <DistantRock position={position} scale={scale} seed={seed} />
      {satellites.map((p) => (
        <DistantRock
          key={p.seed}
          position={p.pos}
          scale={p.scale}
          seed={p.seed}
          solid={p.scale > 1.2}
        />
      ))}
    </>
  );
}
