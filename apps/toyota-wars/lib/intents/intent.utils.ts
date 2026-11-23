import {
  distanceToRallyPoint,
  engagementRanges,
  fireRangeForOrder as agentFireRangeForOrder,
  fireRangeForWeapon as agentFireRangeForWeapon,
  gatedOn,
  hasSquadRole,
  hasTarget,
  isAdvancingWithTarget,
  strayedRatio,
  whenDirective,
  whenLineOfSightClear,
  whenLineOfSightBlocked,
  whenNotRole,
  whenNotTactic,
  whenRole,
  FIRETEAM_TACTIC,
} from "@toyota/agents";
import { AGENT_CONFIG } from "@/lib/agents/agent-runtime.config";
import {
  SQUAD_DIRECTIVE,
  type AllyAttackOrder,
  type FireDesignation,
} from "@/lib/squad/squad.types";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";

export {
  distanceToRallyPoint,
  engagementRanges,
  gatedOn,
  hasSquadRole,
  hasTarget,
  isAdvancingWithTarget,
  strayedRatio,
  whenDirective,
  whenLineOfSightClear,
  whenLineOfSightBlocked,
  whenNotRole,
  whenNotTactic,
  whenRole,
  FIRETEAM_TACTIC,
  SQUAD_DIRECTIVE,
};

export function fireRangeForWeapon(
  weapon: WeaponConfig,
  designated = false,
): number {
  return agentFireRangeForWeapon(weapon, AGENT_CONFIG, designated);
}

export function fireRangeForOrder(
  weapon: WeaponConfig,
  attackOrder?: AllyAttackOrder | null,
  fireDesignation?: FireDesignation | null,
): number {
  return agentFireRangeForOrder(
    weapon,
    AGENT_CONFIG,
    attackOrder,
    fireDesignation,
  );
}
