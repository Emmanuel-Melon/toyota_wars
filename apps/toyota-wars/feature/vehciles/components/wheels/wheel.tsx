// apps/toyota-wars/feature/vehciles/components/wheels/wheel.tsx
import { isPartDestroyed } from "@/lib/combat/combat.parts";
import { useVehicleContext } from "@/context/vehicle-context";
import { useWheelSpin } from "./use-wheel-spin";
import { WheelHub } from "./wheel-hub";
import { WheelTire } from "./wheel-tire";
import { SuspensionArms } from "./suspension-arms"; // <--- Import arms
import type { WheelProps } from "./types";

// apps/toyota-wars/feature/vehciles/wheels/wheel.tsx]

export function Wheel({ part, steers, motionRef }: WheelProps) {
  const { partHealth, maxHealth, wrecked } = useVehicleContext();
  const detached = isPartDestroyed(partHealth?.[part], part, maxHealth);

  const { steerRef, spinRef } = useWheelSpin({
    steers,
    motionRef,
    detached,
    wrecked,
  });

  const side = part.endsWith("L") ? 1 : -1;

  return (
    <group>
      {/* Anchored inward to chassis; does not rotate with steering */}
      {!detached && <SuspensionArms side={side} />}

      <group ref={steerRef}>
        <WheelHub />
        <group ref={spinRef}>
          <WheelTire />
        </group>
      </group>
    </group>
  );
}
