import type { SideGlassPanelVisualProps } from "../../types";
import { PICKUP, PICKUP_SIDE_WINDOW } from "../../config/vehicle-visual.config";
import { GlassPanelVisual } from "./glass-panel";

export function SideGlassPanelVisual({
  side,
  z,
  glassMat,
  crackMat,
  cracked,
}: SideGlassPanelVisualProps) {
  const x = side * (PICKUP.width / 2 + PICKUP_SIDE_WINDOW.xOffset);

  return (
    <GlassPanelVisual
      position={[x, PICKUP_SIDE_WINDOW.y, z]}
      size={[
        PICKUP_SIDE_WINDOW.thickness,
        PICKUP_SIDE_WINDOW.height,
        PICKUP_SIDE_WINDOW.length,
      ]}
      glassMat={glassMat}
      crackMat={crackMat}
      cracked={cracked}
    />
  );
}
