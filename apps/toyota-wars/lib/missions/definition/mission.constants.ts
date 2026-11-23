// apps/toyota-wars/lib/missions/definition/mission.constants.ts

/**
 * Const name maps for the mission definition. No imports: this file sits at the
 * bottom of the dependency graph so schema, validation, runtime and HUD can all use it.
 */

// ─────────────────────────────────────────────────────────────
// TEAMS & ORDERS
// ─────────────────────────────────────────────────────────────
export const TEAM = {
  ALLY: "ally",
  ENEMY: "enemy",
} as const;

/**
 * The single order a squad starts with. Phase 5 replaces this with multi-step plans
 * (ORDER_TYPE), at which point these values become the plan's first step.
 */
export const INITIAL_ORDER = {
  ATTACK: "attack",
  FOLLOW: "follow",
  FLEE: "flee",
  PATROL: "patrol",
} as const;

// ─────────────────────────────────────────────────────────────
// SPAWN TRIGGERS
// ─────────────────────────────────────────────────────────────
export const TRIGGER_TYPE = {
  START: "start",
  TIME: "time",
  SQUAD_DESTROYED: "squadDestroyed",
} as const;

// ─────────────────────────────────────────────────────────────
// SQUAD EFFECTS (what happens when a squad spawns / is wiped out)
// ─────────────────────────────────────────────────────────────
export const SQUAD_EFFECT_TYPE = {
  RESTORE_HULL: "restoreHull", // restore the player to full health
  NOTICE: "notice", // show a HUD notice
} as const;

export type SquadEffectType =
  (typeof SQUAD_EFFECT_TYPE)[keyof typeof SQUAD_EFFECT_TYPE];

/**
 * Placeholders usable inside notice text, written as {name}:
 *   wave   1-based index of the squad among enemy squads
 *   count  units in the squad
 *   next   units in the next enemy squad that hasn't spawned yet (0 if none)
 */
export const NOTICE_TOKEN = {
  WAVE: "wave",
  COUNT: "count",
  NEXT: "next",
} as const;

// ─────────────────────────────────────────────────────────────
// OBJECTIVES
// ─────────────────────────────────────────────────────────────
export const OBJECTIVE_TYPE = {
  DESTROY_COUNT: "destroyCount", // destroy N units of a team
  DESTROY_SQUAD: "destroySquad", // wipe a squad, or just its leader
  SURVIVE: "survive", // stay alive for N seconds
  KEEP_ALIVE: "keepAlive", // keep at least N units of a squad alive
  CAPTURE: "capture", // put a squad in a zone
  DEFEND: "defend", // hold a zone for N seconds
  REACH: "reach", // get a squad to a point
  ESCORT: "escort", // keep a squad near a point for N seconds
  ARRIVE: "arrive", // get a routed squad to its final waypoint
  DENY_ARRIVAL: "denyArrival", // stop a routed squad from reaching its final waypoint
} as const;

export type ObjectiveType =
  (typeof OBJECTIVE_TYPE)[keyof typeof OBJECTIVE_TYPE];

/** goal: completes on its own. constraint: can only fail (resolves to met if the mission is won). */
export type ObjectiveKind = "goal" | "constraint";

/**
 * Used by the evaluators and by validation, so a mission can't be authored
 * that can never be won.
 */
export const OBJECTIVE_KIND: Record<ObjectiveType, ObjectiveKind> = {
  [OBJECTIVE_TYPE.DESTROY_COUNT]: "goal",
  [OBJECTIVE_TYPE.DESTROY_SQUAD]: "goal",
  [OBJECTIVE_TYPE.SURVIVE]: "goal",
  [OBJECTIVE_TYPE.KEEP_ALIVE]: "constraint",
  [OBJECTIVE_TYPE.CAPTURE]: "goal",
  [OBJECTIVE_TYPE.DEFEND]: "goal",
  [OBJECTIVE_TYPE.REACH]: "goal",
  [OBJECTIVE_TYPE.ESCORT]: "goal",
  [OBJECTIVE_TYPE.ARRIVE]: "goal",
  [OBJECTIVE_TYPE.DENY_ARRIVAL]: "constraint",
};

// ─────────────────────────────────────────────────────────────
// FAIL CONDITIONS
// ─────────────────────────────────────────────────────────────
export const FAIL_TYPE = {
  PLAYER_DESTROYED: "playerDestroyed",
  TIME_LIMIT: "timeLimit",
} as const;
