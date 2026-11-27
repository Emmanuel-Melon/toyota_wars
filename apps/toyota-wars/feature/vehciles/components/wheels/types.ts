// apps/toyota-wars/feature/vehciles/components/wheels/types.ts
import type { RefObject } from "react";

import type { VehiclePart } from "@toyota/combat";
import type { VehicleMotion } from "@/feature/vehciles/vehicles.utils";

export type WheelProps = {
  part: VehiclePart;
  steers: boolean;
  motionRef: RefObject<VehicleMotion>;
};

export type WheelsProps = {
  motionRef: RefObject<VehicleMotion>;
};
