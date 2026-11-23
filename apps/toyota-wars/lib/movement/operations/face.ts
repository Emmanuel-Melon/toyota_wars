// lib/movement/operations/face.ts
import { headingTo, distanceXZ } from "../movement.math";
import {
  IDLE_DRIVE,
  type MovementHandler,
  type MovementOrders,
} from "../movement.types";

export const handleFace: MovementHandler<typeof MovementOrders.Face> = (
  order,
  { state },
) => {
  if (distanceXZ(state.position, order.point) < 1e-3) return IDLE_DRIVE;
  return {
    throttle: 0,
    desiredHeading: headingTo(state.position, order.point),
    steer: 0,
  };
};
