import { Vehicle } from "@toyota/models";
import { GlassPanel } from "./glass-panel";
import type { GlassMaterialProps } from "./types";

export function WindshieldPanel({ glassMat, crackMat }: GlassMaterialProps) {
  return (
    <GlassPanel
      part="windshield"
      position={Vehicle.WINDSHIELD.position}
      rotation={[Vehicle.WINDSHIELD.rotationX, 0, 0]}
      size={[Vehicle.PICKUP.width - 0.2, Vehicle.WINDSHIELD.length, 0.02]}
      glassMat={glassMat}
      crackMat={crackMat}
    />
  );
}
