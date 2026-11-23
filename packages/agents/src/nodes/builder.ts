import { BTNode, BTSelector, BTSequence } from "@toyota/ai";
import type { AgentContext } from "../contracts/agent";
import { AgentNodes } from "./node-ids";
import type { AgentNodeFactoryMap, AgentTreeDef } from "./tree-def";
import { CheckTargetAssigned } from "./conditions/check-target-assigned";
import { CheckHasLeader } from "./conditions/check-has-leader";
import { CheckTargetInRange } from "./conditions/check-target-in-range";
import { CheckAlignedWithTarget } from "./conditions/check-aligned-with-target";
import { CheckLeaderBeyond } from "./conditions/check-leader-beyond";
import { CheckRetreating } from "./conditions/check-retreating";
import { CheckRouted } from "./conditions/check-routed";
import { ChaseWithAvoidanceAction } from "./actions/chase-with-avoidance";
import { StandoffCombatAction } from "./actions/standoff-combat";
import { FormationFireAction } from "./actions/formation-fire";
import { FlankAction } from "./actions/flank";
import { LoSRepositionAction } from "./actions/los-reposition";
import { PinCoverAction } from "./actions/pin-cover";
import { ShootTargetAction } from "./actions/shoot-target";
import { PatrolAction } from "./actions/patrol";
import { FleeAction } from "./actions/flee";
import { AimAtTarget } from "./actions/aim-at-target";
import { FollowLeader } from "./actions/follow-leader";
import { IdleAction } from "./actions/idle";

const agentNodeFactories: AgentNodeFactoryMap = {
  [AgentNodes.CheckTargetAssigned]: () => new CheckTargetAssigned(),
  [AgentNodes.CheckHasLeader]: () => new CheckHasLeader(),
  [AgentNodes.CheckTargetInRange]: ({ range }) => new CheckTargetInRange(range),
  [AgentNodes.CheckAligned]: ({ maxOffsetRad }) =>
    new CheckAlignedWithTarget(maxOffsetRad),
  [AgentNodes.Chase]: ({ standoff }) => new ChaseWithAvoidanceAction(standoff),
  [AgentNodes.StandoffCombat]: ({
    fightingDistance,
    retreatDistance,
    approachSpeed,
  }) =>
    new StandoffCombatAction(fightingDistance, retreatDistance, approachSpeed),
  [AgentNodes.FormationFire]: () => new FormationFireAction(),
  [AgentNodes.Flank]: ({ orbitRadius, orbitSpeed, fireRange }) =>
    new FlankAction(orbitRadius, orbitSpeed, fireRange),
  [AgentNodes.LoSReposition]: ({ clearance, sampleCount }) =>
    new LoSRepositionAction(clearance, sampleCount),
  [AgentNodes.PinCover]: () => new PinCoverAction(),
  [AgentNodes.Shoot]: () => new ShootTargetAction(),
  [AgentNodes.Patrol]: () => new PatrolAction(),
  [AgentNodes.Flee]: () => new FleeAction(),
  [AgentNodes.CheckLeaderBeyond]: ({ distance }) =>
    new CheckLeaderBeyond(distance),
  [AgentNodes.CheckRetreating]: () => new CheckRetreating(),
  [AgentNodes.CheckRouted]: () => new CheckRouted(),
  [AgentNodes.AimAtTarget]: () => new AimAtTarget(),
  [AgentNodes.FollowLeader]: ({ arriveRadius, slowRadius }) =>
    new FollowLeader(arriveRadius, slowRadius),
  [AgentNodes.Idle]: () => new IdleAction(),
};

export function buildAgentTree(def: AgentTreeDef): BTNode<AgentContext> {
  switch (def.type) {
    case "selector":
      return new BTSelector<AgentContext>(
        def.children.map((child) => buildAgentTree(child)),
      );
    case "sequence":
      return new BTSequence<AgentContext>(
        def.children.map((child) => buildAgentTree(child)),
      );
    default: {
      const make = agentNodeFactories[def.type] as (
        params: unknown,
      ) => BTNode<AgentContext>;
      return make(def.params ?? {});
    }
  }
}
