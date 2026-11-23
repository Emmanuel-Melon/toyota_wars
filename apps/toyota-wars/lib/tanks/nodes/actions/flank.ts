// apps/toyota-wars/lib/tanks/nodes/actions/flank.ts
import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { TANK_CONFIG } from "../../tanks.config";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { OrbitTactic } from "../../../tactics/tactics.orbit";
import { engagementRanges } from "../../../intents/intent.utils";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Circle to a side of the target and fire once inside weapon range. */
export class FlankAction extends BTNode<TankContext> {
  private readonly orbit = new OrbitTactic();
  private readonly point = new THREE.Vector3();

  constructor(
    private orbitRadius: number = TANK_CONFIG.combat.fightingDistance,
    private orbitSpeed = 0.8,
    private fireRange: number = TANK_CONFIG.combat.fireRange,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const tactical = ctx.squadOrder.tactical;
    const flankPoint = tactical?.flankPoint;
    const flankVector = tactical?.flankVector;
    if (flankPoint) {
      this.point.set(flankPoint.x, ctx.targetPosition.y, flankPoint.y);
    } else if (flankVector) {
      this.point.set(
        ctx.targetPosition.x + flankVector.x * this.orbitRadius,
        ctx.targetPosition.y,
        ctx.targetPosition.z + flankVector.y * this.orbitRadius,
      );
    } else {
      this.orbit.getNextOrbitPoint(
        ctx.targetPosition,
        ctx.position,
        this.orbitRadius,
        this.orbitSpeed,
        ctx.delta,
        this.point,
      );
    }

    const distance = Math.hypot(
      ctx.targetPosition.x - ctx.position.x,
      ctx.targetPosition.z - ctx.position.z,
    );
    const fireRange = Math.min(this.fireRange, engagementRanges(ctx).fire);
    const hasClearShot = ctx.lineOfSightClear && distance <= fireRange;

    ctx.decision.movement = hasClearShot
      ? { type: MovementOrders.Face, point: ctx.targetPosition }
      : {
          type: MovementOrders.MoveTo,
          point: this.point,
          speed: MOVEMENT_CONFIG.throttle.chase,
          stopDistance: MOVEMENT_CONFIG.stopDistance,
        };
    ctx.decision.weapon = hasClearShot
      ? {
          type: "fireAt",
          point: ctx.targetPosition,
          requireAlignment: false,
        }
      : { type: "hold" };

    return NodeState.RUNNING;
  }
}
