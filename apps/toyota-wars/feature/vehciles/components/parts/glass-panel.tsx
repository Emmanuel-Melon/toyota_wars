"use client";

import { partHealthRatio } from "@/lib/combat/combat.parts";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { FallenPart } from "./fallen-part";
import { dropToGround } from "./helpers";
import type { GlassPanelProps } from "./types";

const ZERO_V3: [number, number, number] = [0, 0, 0];
const GLASS_SPIN: [number, number, number] = [1.4, 0.7, 1.1];

/** A shatterable glass pane with two crack decals that fade in on damage. */
export function GlassPanel({
  part,
  position,
  rotation = ZERO_V3,
  size,
  glassMat,
  crackMat,
}: GlassPanelProps) {
  const { partHealth, maxHealth } = useVehicleContext();
  const ratio = partHealthRatio(partHealth?.[part], part, maxHealth);
  const cracked = ratio < 0.999 && ratio > 0;

  return (
    <FallenPart
      part={part}
      position={position}
      rotation={rotation}
      drop={dropToGround(position[1])}
      spin={GLASS_SPIN}
      debris="glass"
    >
      <mesh material={glassMat} castShadow={false}>
        <boxGeometry args={size} />
      </mesh>
      {cracked && (
        <group>
          <mesh material={crackMat}>
            <boxGeometry args={[0.012, size[1] * 0.9, size[2] + 0.008]} />
          </mesh>
          <mesh
            position={[size[0] * 0.12, 0, 0]}
            rotation={[0, 0, -0.65]}
            material={crackMat}
          >
            <boxGeometry args={[0.01, size[1] * 0.75, size[2] + 0.008]} />
          </mesh>
          <mesh
            position={[-size[0] * 0.18, size[1] * 0.12, 0]}
            rotation={[0, 0, 0.5]}
            material={crackMat}
          >
            <boxGeometry args={[0.01, size[1] * 0.6, size[2] + 0.008]} />
          </mesh>
        </group>
      )}
    </FallenPart>
  );
}
