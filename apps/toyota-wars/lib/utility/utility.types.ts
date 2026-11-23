// toyota-wars/lib/utility/utility.types.ts
import type { TankContext } from "../tanks/tanks.types";
import type { UtilityOption } from "../selector/types";

export const TANK_INTENT = {
  ATTACK: "attack",
  PIN: "pin",
  RETREAT: "retreat",
  FLANK: "flank",
  LOS_REPOSITION: "losReposition",
  FOLLOW_LEADER: "followLeader",
  PATROL: "patrol",
} as const;

export type TankIntent = (typeof TANK_INTENT)[keyof typeof TANK_INTENT];

export type TankUtilityOption = UtilityOption<TankContext, TankIntent>;
