// lib/tanks/tanks.builder.ts
import {
  BTNode,
  BTSelector,
  BTSequence,
} from "../behavior-tree/behavior-tree.core";
import type { NodeFactoryMap, TankContext } from "./tanks.types";
import { TankNodes } from "./tanks.config";
import type { TreeDef } from "./tanks.types";
import { CheckTargetAssigned } from "./nodes/conditions/check-target-assigned";
import { CheckHasLeader } from "./nodes/conditions/check-has-leader";
import { CheckTargetInRange } from "./nodes/conditions/check-target-in-range";
import { CheckAlignedWithTarget } from "./nodes/conditions/check-aligned-with-target";
import { CheckLeaderBeyond } from "./nodes/conditions/check-leader-beyond";
import { CheckRetreating } from "./nodes/conditions/check-retreating";
import { CheckRouted } from "./nodes/conditions/check-routed";
import { ChaseWithAvoidanceAction } from "./nodes/actions/chase-with-avoidance";
import { StandoffCombatAction } from "./nodes/actions/standoff-combat";
import { FormationFireAction } from "./nodes/actions/formation-fire";
import { FlankAction } from "./nodes/actions/flank";
import { LoSRepositionAction } from "./nodes/actions/los-reposition";
import { PinCoverAction } from "./nodes/actions/pin-cover";
import { ShootTargetAction } from "./nodes/actions/shoot-target";
import { PatrolAction } from "./nodes/actions/patrol";
import { FleeAction } from "./nodes/actions/flee";
import { AimAtTarget } from "./nodes/actions/aim-at-target";
import { FollowLeader } from "./nodes/actions/follow-leader";
import { IdleAction } from "./nodes/actions/idle";

const tankNodeFactories: NodeFactoryMap = {
  [TankNodes.CheckTargetAssigned]: () => new CheckTargetAssigned(),
  [TankNodes.CheckHasLeader]: () => new CheckHasLeader(),
  [TankNodes.CheckTargetInRange]: ({ range }) => new CheckTargetInRange(range),
  [TankNodes.CheckAligned]: ({ maxOffsetRad }) =>
    new CheckAlignedWithTarget(maxOffsetRad),
  [TankNodes.Chase]: ({ standoff }) => new ChaseWithAvoidanceAction(standoff),
  [TankNodes.StandoffCombat]: ({
    fightingDistance,
    retreatDistance,
    approachSpeed,
  }) =>
    new StandoffCombatAction(fightingDistance, retreatDistance, approachSpeed),
  [TankNodes.FormationFire]: () => new FormationFireAction(),
  [TankNodes.Flank]: ({ orbitRadius, orbitSpeed, fireRange }) =>
    new FlankAction(orbitRadius, orbitSpeed, fireRange),
  [TankNodes.LoSReposition]: ({ clearance, sampleCount }) =>
    new LoSRepositionAction(clearance, sampleCount),
  [TankNodes.PinCover]: () => new PinCoverAction(),
  [TankNodes.Shoot]: () => new ShootTargetAction(),
  [TankNodes.Patrol]: () => new PatrolAction(),
  [TankNodes.Flee]: () => new FleeAction(),
  [TankNodes.CheckLeaderBeyond]: ({ distance }) =>
    new CheckLeaderBeyond(distance),
  [TankNodes.CheckRetreating]: () => new CheckRetreating(),
  [TankNodes.CheckRouted]: () => new CheckRouted(),
  [TankNodes.AimAtTarget]: () => new AimAtTarget(),
  [TankNodes.FollowLeader]: ({ arriveRadius, slowRadius }) =>
    new FollowLeader(arriveRadius, slowRadius),
  [TankNodes.Idle]: () => new IdleAction(),
};

export function buildTankTree(def: TreeDef): BTNode<TankContext> {
  switch (def.type) {
    case "selector":
      return new BTSelector<TankContext>(def.children.map(buildTankTree));
    case "sequence":
      return new BTSequence<TankContext>(def.children.map(buildTankTree));
    default: {
      // TS can't correlate def.type with its params through the map, so cast once, here.
      const make = tankNodeFactories[def.type] as (
        p: unknown,
      ) => BTNode<TankContext>;
      return make(def.params ?? {});
    }
  }
}
