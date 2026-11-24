import { SHARED_VEHICLE_FRAME } from "./shared.vehicle";
import type { VehicleModel } from "../vehicle.types";

export const hiaceVehicle: VehicleModel = {
  id: "hiace",
  label: "Hiace",
  description:
    "Support truck with a slow-firing rocket launcher and a heavy punch.",
  body: "pickup",
  platform: "support",
  weapon: "type63",
  frame: SHARED_VEHICLE_FRAME,
};
