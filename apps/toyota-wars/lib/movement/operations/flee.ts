// lib/movement/operations/flee.ts
import { findCoverPoint } from "../movement.cover";
import { chooseFleeHeading } from "../movement.flee";
import {
  IDLE_DRIVE,
  type MovementHandler,
  type MovementOrders,
} from "../movement.types";

export const handleFlee: MovementHandler<typeof MovementOrders.Flee> = (
  order,
  ctx,
) => {
  const { state, world, config, steering } = ctx;
  const throttle = order.speed ?? 1;
  const cover = findCoverPoint(
    state.position,
    order.threats,
    world.obstacles,
    world.bound,
    config.avoidance.bodyRadius,
    config.flee,
  );
  if (cover) {
    return steering.steerToward(
      cover,
      ctx,
      throttle,
      config.flee.coverStopDistance,
    );
  }

  const heading = chooseFleeHeading(
    state.position,
    order.threats,
    state.heading,
    world.bound,
    config.flee,
  );
  if (heading === null) return IDLE_DRIVE;
  return {
    throttle,
    desiredHeading: heading,
    steer: 0,
  };
};
