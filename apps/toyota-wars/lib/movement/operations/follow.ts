// lib/movement/operations/follow.ts
import {
  arriveThrottle,
  distanceXZ,
  offsetFromHeading,
} from "../movement.math";
import {
  IDLE_DRIVE,
  type MovementHandler,
  type MovementOrders,
} from "../movement.types";

export const handleFollow: MovementHandler<typeof MovementOrders.Follow> = (
  order,
  ctx,
) => {
  const { state, config, scratch } = ctx;
  const arriveRadius = order.arriveRadius ?? config.arriveRadius;
  const slowRadius = order.slowRadius ?? config.slowRadius;
  const [right, forward] = order.offset;

  const target = offsetFromHeading(
    order.leader.position,
    order.leader.heading,
    right,
    forward,
    scratch,
  );

  const dist = distanceXZ(target, state.position);
  if (dist <= arriveRadius) return IDLE_DRIVE;

  const throttle = arriveThrottle(dist, arriveRadius, slowRadius);
  return ctx.steering.steerToward(target, ctx, throttle, arriveRadius);
};
