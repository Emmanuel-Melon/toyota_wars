// src/modules/tanks/tanks.builder.ts
import {
  BTNode,
  BTSelector,
  BTSequence,
} from "@/lib/behavior-tree/behavior-tree.core";
import { UtilitySelector } from "@/lib/behavior-tree/utility-selector";
import type { NodeFactoryMap, TankContext, TreeDef, TankIntent } from "./tanks.types";
import { TankNodes, TANK_CONFIG } from "./tanks.config";
import { MOVEMENT_CONFIG } from "@/lib/movement/movement.config";

// Condition Nodes
import { CheckTargetAssigned } from "./nodes/conditions/check-target-assigned";
import { CheckHasLeader } from "./nodes/conditions/check-has-leader";
import { CheckTargetInRange } from "./nodes/conditions/check-target-in-range";
import { CheckAlignedWithTarget } from "./nodes/conditions/check-aligned-with-target";
import { CheckLeaderBeyond } from "./nodes/conditions/check-leader-beyond";
import { CheckRetreating } from "./nodes/conditions/check-retreating";
import { CheckRouted } from "./nodes/conditions/check-routed";

// Action Nodes
import { ChaseWithAvoidanceAction } from "./nodes/actions/chase-with-avoidance";
import { StandoffCombatAction } from "./nodes/actions/standoff-combat";
import { FormationFireAction } from "./nodes/actions/formation-fire";
import { FlankAction } from "./nodes/actions/flank";
import { ShootTargetAction } from "./nodes/actions/shoot-target";
import { PatrolAction } from "./nodes/actions/patrol";
import { FleeAction } from "./nodes/actions/flee";
import { AimAtTarget } from "./nodes/actions/aim-at-target";
import { FollowLeader } from "./nodes/actions/follow-leader";
import { IdleAction } from "./nodes/actions/idle";

import { TANK_INTENT, createUtilityDebug, tankOptions } from "./tanks.utility";

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
    new StandoffCombatAction(
      fightingDistance ?? 55,
      retreatDistance ?? 45,
      approachSpeed ?? MOVEMENT_CONFIG.throttle.chase,
    ),
  [TankNodes.FormationFire]: () => new FormationFireAction(),
  [TankNodes.Flank]: ({ orbitRadius, orbitSpeed, fireRange }) =>
    new FlankAction(orbitRadius, orbitSpeed, fireRange),
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
      const make = tankNodeFactories[def.type] as (
        p: unknown,
      ) => BTNode<TankContext>;
      return make(def.params ?? {});
    }
  }
}

// Utility Tree definitions
const UTILITY_ATTACK: TreeDef = {
  type: "sequence",
  children: [
    { type: TankNodes.CheckTargetAssigned },
    {
      type: "selector",
      children: [
        {
          type: "sequence",
          children: [{ type: TankNodes.CheckHasLeader }, { type: TankNodes.FormationFire }],
        },
        {
          type: "sequence",
          children: [
            {
              type: TankNodes.CheckTargetInRange,
              params: { range: TANK_CONFIG.combat.fireRange },
            },
            {
              type: TankNodes.StandoffCombat,
              params: {
                fightingDistance: TANK_CONFIG.combat.fightingDistance,
                retreatDistance: TANK_CONFIG.combat.retreatDistance,
                approachSpeed: 0.7,
              },
            },
          ],
        },
        {
          type: TankNodes.Chase,
          params: { standoff: TANK_CONFIG.combat.fightingDistance },
        },
      ],
    },
  ],
};

const UTILITY_FLANK: TreeDef = {
  type: "sequence",
  children: [
    { type: TankNodes.CheckTargetAssigned },
    {
      type: TankNodes.Flank,
      params: {
        orbitRadius: TANK_CONFIG.combat.fireRange * 0.8,
        orbitSpeed: 0.4,
        fireRange: TANK_CONFIG.combat.fireRange,
      },
    },
  ],
};

const UTILITY_FOLLOW_LEADER: TreeDef = {
  type: "selector",
  children: [
    {
      type: "sequence",
      children: [
        { type: TankNodes.CheckTargetAssigned },
        {
          type: TankNodes.CheckTargetInRange,
          params: { range: TANK_CONFIG.combat.fireRange },
        },
        { type: TankNodes.FormationFire },
      ],
    },
    { type: TankNodes.FollowLeader },
  ],
};

const UTILITY_PATROL: TreeDef = { type: TankNodes.Patrol };

const FLEE: TreeDef = {
  type: "selector",
  children: [{ type: TankNodes.Flee }, { type: TankNodes.Idle }],
};

const UTILITY_ROUT: TreeDef = {
  type: "sequence",
  children: [{ type: TankNodes.CheckRouted }, { type: TankNodes.Flee }],
};

/** Build a fresh utility root (and fresh stateful subtrees) for one tank on the server. */
export function buildUtilityTankTree(unitId: string): BTNode<TankContext> {
  const children: Record<TankIntent, BTNode<TankContext>> = {
    [TANK_INTENT.ATTACK]: buildTankTree(UTILITY_ATTACK),
    [TANK_INTENT.RETREAT]: buildTankTree(FLEE),
    [TANK_INTENT.FLANK]: buildTankTree(UTILITY_FLANK),
    [TANK_INTENT.FOLLOW_LEADER]: buildTankTree(UTILITY_FOLLOW_LEADER),
    [TANK_INTENT.PATROL]: buildTankTree(UTILITY_PATROL),
  };

  const utility = new UtilitySelector<TankContext, TankIntent>(
    tankOptions,
    children,
    {
      momentumBonus: TANK_CONFIG.utility.momentumBonus,
      minCommitMs: TANK_CONFIG.utility.minCommitMs,
      debug: createUtilityDebug(unitId),
    },
  );

  return new BTSelector<TankContext>([buildTankTree(UTILITY_ROUT), utility]);
}