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
  return (
    <GlassPanel
      part={part}
      position={[side * (Vehicle.PICKUP.width / 2 + 0.03), 1.17, z]}
      size={[0.022, 0.32, 0.78]}
      glassMat={glassMat}
      crackMat={crackMat}
    />
  );
}
