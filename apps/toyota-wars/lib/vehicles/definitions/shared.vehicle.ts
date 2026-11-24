import { TANK_HIT_PARTS } from "../../combat/combat.hitboxes";
import type { VehicleFrame } from "../vehicle.types";

export const SHARED_VEHICLE_FRAME: VehicleFrame = {
  colliderHalfExtents: [1.3, 0.575, 2.1],
  axleY: -0.225,
  axles: [
    { z: 1.5, steers: true },
    { z: -1.5, steers: false },
  ],
  trackHalfWidth: 1.425,
  wheelRadius: 0.55,
  mountPosition: [0, 0.475, -1.65],
  hitboxes: TANK_HIT_PARTS,
};
