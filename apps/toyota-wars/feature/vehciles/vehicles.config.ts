import { VEHICLE_STEERING } from "@/lib/vehicles/vehicle.motion";
import { WHEEL_VISUAL } from "@toyota/models";

export const WHEEL = {
  ...WHEEL_VISUAL,
  wheelbase: VEHICLE_STEERING.wheelbase,
  maxSteer: VEHICLE_STEERING.maxSteer,
} as const;
