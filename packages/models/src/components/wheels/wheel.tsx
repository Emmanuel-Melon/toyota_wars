import type { WheelVisualProps } from "../../types";
import { SuspensionArms } from "./suspension-arms";
import { WheelHub } from "./wheel-hub";
import { WheelTire } from "./wheel-tire";

export function WheelVisual({
  side,
  steerRef,
  spinRef,
  showSuspension = true,
  radius,
  width,
}: WheelVisualProps) {
  return (
    <group>
      {showSuspension && <SuspensionArms side={side} radius={radius} />}
      <group ref={steerRef}>
        <WheelHub radius={radius} />
        <group ref={spinRef}>
          <WheelTire radius={radius} width={width} />
        </group>
      </group>
    </group>
  );
}
