import { PICKUP } from "@toyota/models";
import { GlassPanel } from "./glass-panel";
import type { GlassMaterialProps } from "./types";

export function RearWindowPanel({ glassMat, crackMat }: GlassMaterialProps) {
  return (
    <GlassPanel
      part="windowRear"
      position={[0, 1.18, -1.3]}
      size={[PICKUP.width - 0.35, 0.28, 0.02]}
      glassMat={glassMat}
      crackMat={crackMat}
    />
  );
}
