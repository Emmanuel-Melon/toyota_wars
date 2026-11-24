import type { GlassMaterialProps } from "../../types";
import { PICKUP, WINDSHIELD } from "../../config/vehicle-visual.config";
import { GlassPanelVisual } from "./glass-panel";

export function WindshieldPanelVisual({
  glassMat,
  crackMat,
  cracked,
}: GlassMaterialProps) {
  return (
    <GlassPanelVisual
      position={WINDSHIELD.position}
      rotation={[WINDSHIELD.rotationX, 0, 0]}
      size={[PICKUP.width - 0.2, WINDSHIELD.length, 0.02]}
      glassMat={glassMat}
      crackMat={crackMat}
      cracked={cracked}
    />
  );
}
