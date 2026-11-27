"use client";

import { Vehicle } from "@toyota/models";
import { partHealthRatio } from "@toyota/combat";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { FallenPart } from "./fallen-part";
import { dropToGround } from "./helpers";
import type { GlassPanelProps } from "./types";

const ZERO_V3: [number, number, number] = [0, 0, 0];
const GLASS_SPIN: [number, number, number] = [1.4, 0.7, 1.1];

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
      <Vehicle.GlassPanelVisual
        position={ZERO_V3}
        rotation={ZERO_V3}
        size={size}
        glassMat={glassMat}
        crackMat={crackMat}
        cracked={cracked}
      />
    </FallenPart>
  );
}
