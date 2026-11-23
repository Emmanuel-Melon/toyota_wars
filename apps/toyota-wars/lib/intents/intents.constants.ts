// lib/tanks/intents/intent.constants.ts
// Constants shared by an intent's option AND its tree (or by several intents).
// Anything used by only one half of one intent stays local to that intent.
import { TANK_CONFIG } from "../tanks/tanks.config";

export const FIRE_RANGE = TANK_CONFIG.combat.fireRange;
