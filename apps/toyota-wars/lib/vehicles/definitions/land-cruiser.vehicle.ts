import { SHARED_VEHICLE_FRAME } from "./shared.vehicle";
import type { VehicleModel } from "../vehicle.types";

export const landCruiserVehicle: VehicleModel = {
  id: "land-cruiser",
  label: "Land Cruiser",
  description:
    "Armored autocannon platform with balanced protection and rate of fire.",
  body: "pickup",
  platform: "armored",
  weapon: "zu23",
  frame: SHARED_VEHICLE_FRAME,
};
