// apps/toyota-wars/lib/meso/meso.types.ts
import type { SquadDirective } from "@/lib/squad/squad.types";
import type { VehiclePlatform } from "@/lib/vehicles/vehicle.types";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";

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
  vehicle: VehiclePlatform;
  weapon: WeaponConfig;
  isRetreating: boolean;
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
