// lib/movement/movement.resolver.ts
import * as THREE from "three";
import { AvoidanceSteeringSolver } from "./movement.steering";
import {
  MOVEMENT_CONFIG,
  createResolvedConfig,
  resolveMovementConfig,
} from "./movement.config";
import { distanceXZ } from "./movement.math";
import {
  IDLE_DRIVE,
  MovementOrders,
  type DriveCommand,
  type MovementContext,
  type MovementHandlers,
  type MovementOrder,
  type OrderResolver,
  type TankThreat,
  type VehicleState,
  type WorldMovement,
} from "./movement.types";
import { handleIdle } from "./operations/idle";
import { handleFace } from "./operations/face";
import { handleMoveTo } from "./operations/move-to";
import { handleFollow } from "./operations/follow";
import { handleFlee } from "./operations/flee";

/** Compile error if an order type is added without a handler. */
const movementHandlers: MovementHandlers = {
  [MovementOrders.Idle]: handleIdle,
  [MovementOrders.Face]: handleFace,
  [MovementOrders.MoveTo]: handleMoveTo,
  [MovementOrders.Follow]: handleFollow,
  [MovementOrders.Flee]: handleFlee,
};

type AnyHandler = (order: MovementOrder, ctx: MovementContext) => DriveCommand;

export class DefaultOrderResolver implements OrderResolver {
  /** One context per resolver, mutated each tick (no per-tick allocation). */
  private readonly _ctx: MovementContext = {
    state: {
      position: new THREE.Vector3(),
      heading: 0,
      speed: 0,
      fuel: MOVEMENT_CONFIG.body.fuel.maxFuel,
    },
    world: { bound: 0, obstacles: [] },
    config: createResolvedConfig(),
    dt: 0,
    steering: new AvoidanceSteeringSolver(),
    scratch: new THREE.Vector3(),
  };

  resolve(
    order: MovementOrder,
    state: VehicleState,
    world: WorldMovement,
    dt: number,
  ): DriveCommand {
    const ctx = this._ctx;
    ctx.state = state;
    ctx.world = world;
    ctx.dt = dt;
    resolveMovementConfig(world, ctx.config);

    // TypeScript can't correlate `order.type` with its handler across the
    // union, so the single cast lives here. MovementHandlers guarantees
    // each handler matches its order type.
    const handler = movementHandlers[order.type] as AnyHandler | undefined;
    return handler ? handler(order, ctx) : IDLE_DRIVE;
  }
}

export function nearestThreatDistance(
  position: Readonly<THREE.Vector3>,
  threats: readonly TankThreat[],
): number {
  let nearest = Infinity;
  for (const threat of threats) {
    nearest = Math.min(nearest, distanceXZ(position, threat.position));
  }
  return nearest;
}
