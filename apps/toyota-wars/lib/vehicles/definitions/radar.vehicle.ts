import { SHARED_VEHICLE_FRAME } from "./shared.vehicle";
import type { VehicleModel } from "../vehicle.types";

export const radarVehicle: VehicleModel = {
  id: "radar",
  label: "Radar",
  description:
    "Allied support vehicle carrying the radar uplink for drone camera and enemy map intel.",
  body: "pickup",
  platform: "support",
  weapon: "type63",
  frame: SHARED_VEHICLE_FRAME,
};
