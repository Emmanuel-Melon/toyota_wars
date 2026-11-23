// apps/toyota-wars/feature/vehciles/components/pickup/pickup-primitives.tsx
"use client";

import * as THREE from "three";

type V3 = [number, number, number];

type BoxProps = {
  p: V3;
  s: V3;
  m: THREE.Material;
  r?: V3;
  shadow?: boolean;
};

export function Box({ p, s, m, r, shadow = true }: BoxProps) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={shadow}>
      <boxGeometry args={s} />
    </mesh>
  );
}

export function Cyl({
  p,
  r,
  len,
  m,
  rot = [0, 0, 0],
}: {
  p: V3;
  r: number;
  len: number;
  m: THREE.Material;
  rot?: V3;
}) {
  return (
    <mesh position={p} rotation={rot} material={m} castShadow>
      <cylinderGeometry args={[r, r, len, 10]} />
    </mesh>
  );
}
