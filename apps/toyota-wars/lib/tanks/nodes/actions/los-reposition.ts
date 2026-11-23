import * as THREE from "three";
import { engagementRanges } from "../../../intents/intent.utils";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { findFiringRepositionPoint } from "../../../tactics/tactics.reposition";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";
import type { TankContext } from "../../tanks.types";

export class LoSRepositionAction extends BTNode<TankContext> {
  private readonly waypoint = new THREE.Vector3();

  constructor(
    private clearance: number = MOVEMENT_CONFIG.reposition.clearance,
    private sampleCount: number = MOVEMENT_CONFIG.reposition.sampleCount,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (ctx.lineOfSightClear || !ctx.targetPosition || !ctx.lastKnownPosition) {
      return NodeState.FAILURE;
    }

    const optimalRange = Math.min(
      ctx.weapon.preferredRange,
      engagementRanges(ctx).fire,
    );
    const found = findFiringRepositionPoint(
      {
        origin: ctx.weaponOrigin,
        target: ctx.lastKnownPosition,
        blockingObstacle: ctx.blockingObstacle,
        obstacles: ctx.obstacles,
        optimalRange,
        bodyRadius: MOVEMENT_CONFIG.body.radius,
        clearance: this.clearance,
        bound: ctx.bound,
        sampleCount: this.sampleCount,
        heading: ctx.heading,
      },
      this.waypoint,
    );

    if (!found) {
      ctx.decision.movement = {
        type: MovementOrders.Face,
        point: ctx.lastKnownPosition,
      };
      ctx.decision.weapon = { type: "hold" };
      return NodeState.RUNNING;
    }

    ctx.decision.movement = {
      type: MovementOrders.MoveTo,
      point: this.waypoint,
      speed: MOVEMENT_CONFIG.throttle.chase,
      stopDistance: MOVEMENT_CONFIG.reposition.stopDistance,
      slowRadius: MOVEMENT_CONFIG.follow.slowRadius,
    };
    ctx.decision.weapon = { type: "hold" };
    return NodeState.RUNNING;
  }
}
