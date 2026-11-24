import { SHARED_VEHICLE_FRAME } from "./shared.vehicle";
import type { VehicleModel } from "../vehicle.types";

export const hiluxVehicle: VehicleModel = {
  id: "hilux",
  label: "Hilux",
  description:
    "Fast technical with a heavy machine gun. Agile, light, and quick to fire.",
  body: "pickup",
  platform: "technical",
  weapon: "dshk",
  frame: SHARED_VEHICLE_FRAME,
};
