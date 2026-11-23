import * as THREE from "three";
import type { TankContext } from "../../tanks.types";
import { TANK_CONFIG } from "../../tanks.config";
import { MOVEMENT_CONFIG } from "../../../movement/movement.config";
import { MovementOrders } from "../../../movement/movement.types";
import { OrbitTactic } from "../../../tactics/tactics.orbit";
import { BTNode } from "../../../behavior-tree/behavior-tree.core";
import { NodeState } from "../../../behavior-tree/behavior-tree.config";

/** Circle to a side of the target and fire once inside weapon range. */
export class FlankAction extends BTNode<TankContext> {
  private readonly orbit = new OrbitTactic();
  private readonly orbitPoint = new THREE.Vector3();

  constructor(
    private orbitRadius: number = TANK_CONFIG.combat.fightingDistance,
    private orbitSpeed = 0.8,
    private fireRange: number = TANK_CONFIG.combat.fireRange,
  ) {
    super();
  }

  evaluate(ctx: TankContext): NodeState {
    if (!ctx.targetPosition) return NodeState.FAILURE;

    const point = this.orbit.getNextOrbitPoint(
      ctx.targetPosition,
      ctx.position,
      this.orbitRadius,
      this.orbitSpeed,
      ctx.delta,
      this.orbitPoint,
    );

    ctx.decision.movement = {
      type: MovementOrders.MoveTo,
      point,
      speed: MOVEMENT_CONFIG.throttle.chase,
      stopDistance: MOVEMENT_CONFIG.stopDistance,
    };

    ctx.decision.weapon =
      ctx.position.distanceTo(ctx.targetPosition) <= this.fireRange
        ? {
            type: "fireAt",
            point: ctx.targetPosition,
            requireAlignment: false,
          }
        : { type: "hold" };

    return NodeState.RUNNING;
  }
}
