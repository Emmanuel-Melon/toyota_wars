// lib/tanks/intents/intents.registry.ts
import {
  TANK_INTENT,
  type TankIntent,
  type TankUtilityOption,
} from "@/lib/utility/utility.types";
import type { IntentDef } from "./intent.types";
import { attackIntent } from "./options/attack";
import { pinIntent } from "./options/pin";
import { flankIntent } from "./options/flank";
import { losRepositionIntent } from "./options/los-reposition";
import { followLeaderIntent } from "./options/follow-leader";
import { patrolIntent } from "./options/patrol";
import { retreatIntent } from "./options/retreat";

/** Adding an intent: add its id to TANK_INTENT, create its folder, add one line here. */
export const INTENTS = {
  [TANK_INTENT.ATTACK]: attackIntent,
  [TANK_INTENT.PIN]: pinIntent,
  [TANK_INTENT.RETREAT]: retreatIntent,
  [TANK_INTENT.FLANK]: flankIntent,
  [TANK_INTENT.LOS_REPOSITION]: losRepositionIntent,
  [TANK_INTENT.FOLLOW_LEADER]: followLeaderIntent,
  [TANK_INTENT.PATROL]: patrolIntent,
} satisfies { [K in TankIntent]: IntentDef<K> };

export const ALL_INTENTS: IntentDef[] = Object.values(INTENTS);

/**
 * Flat option list for the selector. Order is the tie-break order
 * (first option wins ties), so it follows the INTENTS order above.
 */
export const tankOptions: TankUtilityOption[] = ALL_INTENTS.flatMap(
  (i) => i.options,
);
