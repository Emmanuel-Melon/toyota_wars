// apps/toyota-wars/feature/vehciles/components/wheels/index.tsx
"use client";

import type { VehiclePart } from "@/lib/combat/combat.teams";
import type { WheelsProps } from "./types";
import { Wheel } from "./wheel";
import { useVehicleContext } from "@/context/vehicle-context";
import { FallenPart } from "../parts/vehicle-parts";
import { VEHICLE_MODELS } from "@/lib/vehicles/vehicle.config";

function partNameFor(steers: boolean, side: number): VehiclePart {
  return `${steers ? "wheelF" : "wheelR"}${side > 0 ? "L" : "R"}` as VehiclePart;
}

export function Wheels({ motionRef }: WheelsProps) {
  const { wrecked, model } = useVehicleContext();
  const frame = VEHICLE_MODELS[model].frame;
  const TRACK_INWARD_FACTOR = 0.86; // Pulls wheels inward slightly

  return (
    <>
      {frame.axles.flatMap(({ z, steers }) =>
        [-1, 1].map((side) => {
          const part = partNameFor(steers, side);
          return (
            <FallenPart
              key={part}
              part={part}
              position={[
                side * frame.trackHalfWidth * TRACK_INWARD_FACTOR,
                frame.axleY,
                z,
              ]}
              drop={frame.wheelRadius}
              spin={[0.35, side * 1.2, side * 0.9]}
              debris="wheel"
              forceDetach={wrecked}
              scatter={wrecked ? 2.2 : 0}
            >
              <Wheel part={part} steers={steers} motionRef={motionRef} />
            </FallenPart>
          );
        }),
      )}
    </>
  );
}
