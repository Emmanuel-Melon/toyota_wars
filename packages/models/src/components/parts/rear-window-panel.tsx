import type { GlassMaterialProps } from "../../types";
import { PICKUP } from "../../config/vehicle-visual.config";
import { GlassPanelVisual } from "./glass-panel";

export function RearWindowPanelVisual({
  glassMat,
  crackMat,
  cracked,
}: GlassMaterialProps) {
  return (
    <GlassPanelVisual
      position={[0, 1.18, -1.3]}
      size={[PICKUP.width - 0.35, 0.28, 0.02]}
      glassMat={glassMat}
      crackMat={crackMat}
      cracked={cracked}
    />
  );
}
