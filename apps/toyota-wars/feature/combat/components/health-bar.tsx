// components/plains/three/health-bar.tsx
"use client";

import { Billboard } from "@react-three/drei";

const WIDTH = 2.2;
const HEIGHT = 0.26;

export function HealthBar({
  value,
  max,
  color,
  position = [0, 2.6, 0],
}: {
  value: number;
  max: number;
  color: string;
  position?: [number, number, number];
}) {
  const ratio = Math.max(0, Math.min(1, value / max));

  return (
    <Billboard position={position}>
      <mesh renderOrder={1}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial
          color="#1b1a16"
          transparent
          opacity={0.7}
          toneMapped={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      {ratio > 0 && (
        <mesh position={[-(1 - ratio) * (WIDTH / 2), 0, 0.01]} renderOrder={2}>
          <planeGeometry args={[WIDTH * ratio, HEIGHT * 0.72]} />
          <meshBasicMaterial
            color={color}
            transparent
            toneMapped={false}
            depthWrite={false}
            depthTest={false}
          />
        </mesh>
      )}
    </Billboard>
  );
}
