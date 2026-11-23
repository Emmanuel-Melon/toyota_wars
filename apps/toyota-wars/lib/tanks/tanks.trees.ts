// lib/tanks/tanks.trees.ts
import { TANK_CONFIG } from "./tanks.config";
import type { TankContext } from "./tanks.types";
import { BTSelector, type BTNode } from "../behavior-tree/behavior-tree.core";
import { UtilitySelector } from "../selector/node";
import { buildTankTree } from "./tanks.builder";

import { ROUT_TREE } from "./trees/rout";
import type { TankIntent } from "../utility/utility.types";
import { createUtilityDebug } from "../utility/utility.core";
import { ALL_INTENTS, tankOptions } from "../intents/intents.registry";

/** Build a fresh utility root (and fresh stateful subtrees) for one tank. */
export function buildUtilityTankTree(unitId: string): BTNode<TankContext> {
  const children = {} as Record<TankIntent, BTNode<TankContext>>;
  for (const intent of ALL_INTENTS) {
    children[intent.id] = buildTankTree(intent.tree);
  }

  const utility = new UtilitySelector<TankContext, TankIntent>(
    tankOptions,
    children,
    {
      momentumBonus: TANK_CONFIG.utility.momentumBonus,
      minCommitMs: TANK_CONFIG.utility.minCommitMs,
      forcedIntent: (ctx) => ctx.squadOrder.forcedIntent,
      debug: createUtilityDebug(unitId),
    },
  );

  return new BTSelector<TankContext>([buildTankTree(ROUT_TREE), utility]);
}
