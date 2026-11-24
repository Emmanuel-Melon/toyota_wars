import { VEHICLE_STEERING } from "@/lib/vehicles/vehicle.motion";
import { Vehicle } from "@toyota/models";

export const WHEEL = {
  ...Vehicle.WHEEL_VISUAL,
  wheelbase: VEHICLE_STEERING.wheelbase,
  maxSteer: VEHICLE_STEERING.maxSteer,
} as const;
