import type { SideGlassPanelVisualProps } from "../../types";
import { PICKUP } from "../../config/vehicle-visual.config";
import { GlassPanelVisual } from "./glass-panel";

export function SideGlassPanelVisual({
  side,
  z,
  glassMat,
  crackMat,
  cracked,
}: SideGlassPanelVisualProps) {
  return (
    <GlassPanelVisual
      position={[side * (PICKUP.width / 2 + 0.03), 1.17, z]}
      size={[0.022, 0.32, 0.78]}
      glassMat={glassMat}
      crackMat={crackMat}
      cracked={cracked}
    />
  );
}
