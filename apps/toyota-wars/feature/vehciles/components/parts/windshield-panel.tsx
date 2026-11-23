import { PICKUP, WINDSHIELD } from "@/feature/vehciles/pickup.geometry";
import { GlassPanel } from "./glass-panel";
import type { GlassMaterialProps } from "./types";

export function WindshieldPanel({ glassMat, crackMat }: GlassMaterialProps) {
  return (
    <GlassPanel
      part="windshield"
      position={WINDSHIELD.position}
      rotation={[WINDSHIELD.rotationX, 0, 0]}
      size={[PICKUP.width - 0.2, WINDSHIELD.length, 0.02]}
      glassMat={glassMat}
      crackMat={crackMat}
    />
  );
}
