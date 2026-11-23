// lib/tanks/intents/intent.types.ts
import { UtilityOption } from "../selector/types";
import { TankContext, TreeDef } from "../tanks/tanks.types";
import { TankIntent, TankUtilityOption } from "../utility/utility.types";

/** A scored option pinned to one intent id (a mismatched id fails to compile). */
export type TankOptionFor<Id extends TankIntent> = UtilityOption<
  TankContext,
  Id
>;

/**
 * One intent = what makes it appealing (options) + what it does (tree).
 * Both halves live in one object so they can't be registered separately.
 */
export interface IntentDef<Id extends TankIntent = TankIntent> {
  id: Id;
  /**
   * Scoring models for this intent. More than one is allowed: they are
   * OR-composed (highest raw score represents the intent, see scoreOptions).
   */
  options: TankOptionFor<Id>[];
  /** Behavior executed when the intent wins. */
  tree: TreeDef;
}

export const defineIntent = <Id extends TankIntent>(
  def: IntentDef<Id>,
): IntentDef<Id> => def;
