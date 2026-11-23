"use client";

import { Canvas } from "@react-three/fiber";
import { WeaponMount } from "@/feature/weapons/components/mounts";
import { PLAYER_PALETTE } from "@/lib/palettes";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";

export function WeaponPreview({ weapon }: { weapon: WeaponConfig }) {
  return (
    <Canvas
      key={weapon.id}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.4, 4.6], fov: 34 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} />
      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.7}
        color="#9db5c8"
      />
      <group
        position={[-0.65, -0.08, 0]}
        rotation={[0.12, Math.PI / 2, 0]}
        scale={1.35}
      >
        <WeaponMount kind={weapon.visual.mount} palette={PLAYER_PALETTE} />
      </group>
    </Canvas>
  );
}
