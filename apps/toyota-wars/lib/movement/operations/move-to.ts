// lib/movement/operations/move-to.ts
import { arriveThrottle, distanceXZ } from "../movement.math";
import type { MovementHandler, MovementOrders } from "../movement.types";

export const handleMoveTo: MovementHandler<typeof MovementOrders.MoveTo> = (
  order,
  ctx,
) => {
  const stopDistance = order.stopDistance ?? ctx.config.stopDistance;
  let throttle = order.speed ?? 1;

  // Opt-in: only slow down when the order asks for it, so existing
  // moveTo orders keep their constant-throttle behavior.
  if (order.slowRadius !== undefined) {
    throttle *= arriveThrottle(
      distanceXZ(order.point, ctx.state.position),
      stopDistance,
      order.slowRadius,
    );
  }

  return ctx.steering.steerToward(order.point, ctx, throttle, stopDistance);
};
