import { Vehicle } from "@toyota/models";
import { GlassPanel } from "./glass-panel";
import type { SideGlassPanelProps } from "./types";

export function SideGlassPanel({
  part,
  side,
  z,
  glassMat,
  crackMat,
}: SideGlassPanelProps) {
  const x =
    side * (Vehicle.PICKUP.width / 2 + Vehicle.PICKUP_SIDE_WINDOW.xOffset);

  return (
    <GlassPanel
      part={part}
      position={[x, Vehicle.PICKUP_SIDE_WINDOW.y, z]}
      size={[
        Vehicle.PICKUP_SIDE_WINDOW.thickness,
        Vehicle.PICKUP_SIDE_WINDOW.height,
        Vehicle.PICKUP_SIDE_WINDOW.length,
      ]}
      glassMat={glassMat}
      crackMat={crackMat}
    />
  );
}
