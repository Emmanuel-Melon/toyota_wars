import { Vehicle } from "@toyota/models";
import { isPartDestroyed } from "@toyota/combat";
import { useVehicleContext } from "@/context/vehicle-context";
import { useWheelSpin } from "./use-wheel-spin";
import type { WheelProps } from "./types";

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
    <Vehicle.WheelVisual
      side={side}
      steerRef={steerRef}
      spinRef={spinRef}
      showSuspension={!detached}
    />
  );
}
