export const SQUAD_DIRECTIVE = {
  ADVANCE: "advance",
  HOLD: "hold",
  FLANK: "flank",
  FIGHTING_RETREAT: "fightingRetreat",
  GENERAL_RETREAT: "generalRetreat",
} as const;

export type SquadDirective =
  (typeof SQUAD_DIRECTIVE)[keyof typeof SQUAD_DIRECTIVE];

export const FIRETEAM_TACTIC = {
  HOLD_FORMATION: "holdFormation",
  SUPPRESS_ANVIL: "suppressAnvil",
  FLANK_HOOK: "flankHook",
  COUNTER_AMBUSH: "counterAmbush",
  BOUNDING_RETREAT: "boundingRetreat",
} as const;

export type FireteamTactic =
  (typeof FIRETEAM_TACTIC)[keyof typeof FIRETEAM_TACTIC];

export interface FireteamMember {
  id: string;
  position: { x: number; y: number };
  health: number; // 0 to 1
  isRetreating: boolean;
  vehicle?: unknown;
  weapon?: unknown;
}

export interface FireteamContext {
  fireteamId: string;
  macroDirective: SquadDirective;
  members: FireteamMember[];
  avgHealth: number;
  /** Number of enemy units within local engagement / pursuit radius */
  localEnemiesCount: number;
  /** Number of allied units in this fireteam */
  localAlliesCount: number;
  /** Distance to the closest pursuing enemy */
  closestEnemyDistance: number;
}
