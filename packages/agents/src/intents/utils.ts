import { curves, remap, type Consideration } from "@toyota/ai";
import type { AgentContext } from "../agent.types";
import { AgentConfig } from "../agent.types";
import {
  AgentAttackMode,
  AgentFireteamTactic,
  AgentSquadDirective,
  type AgentFireteamTacticType,
  type AgentSquadDirectiveType,
  type AgentTacticalRole,
} from "../agents.config";
import {
  AgentWeapon,
  AgentAttackOrder,
  AgentFireDesignation,
} from "../contracts";

export const hasTarget: Consideration<AgentContext> = {
  name: "hasTarget",
  input: (ctx) => (ctx.hasAssignedTarget ? 1 : 0),
  curve: curves.step(1),
};

export const gatedOn = <C>(
  name: string,
  predicate: (context: C) => boolean,
): Consideration<C> => ({
  name,
  input: (context) => (predicate(context) ? 1 : 0),
  curve: curves.step(1),
});

export const whenRole = (
  ...roles: AgentTacticalRole[]
): Consideration<AgentContext> =>
  gatedOn<AgentContext>("role", (ctx) => hasSquadRole(ctx, ...roles));

export const whenNotRole = (
  ...roles: AgentTacticalRole[]
): Consideration<AgentContext> =>
  gatedOn<AgentContext>("notRole", (ctx) => !hasSquadRole(ctx, ...roles));

export const whenDirective = (
  ...directives: AgentSquadDirectiveType[]
): Consideration<AgentContext> =>
  gatedOn<AgentContext>("directive", (ctx) =>
    directives.includes(ctx.squadOrder.directive),
  );

export const whenLineOfSightClear: Consideration<AgentContext> = gatedOn(
  "lineOfSightClear",
  (ctx) => ctx.lineOfSightClear,
);

export const whenLineOfSightBlocked: Consideration<AgentContext> = gatedOn(
  "lineOfSightBlocked",
  (ctx) => !ctx.lineOfSightClear,
);

export const whenNotTactic = (
  ...tactics: AgentFireteamTacticType[]
): Consideration<AgentContext> =>
  gatedOn<AgentContext>(
    "notFireteamTactic",
    (ctx) => !tactics.includes(ctx.squadOrder.fireteamTactic),
  );

export const hasSquadRole = (
  ctx: AgentContext,
  ...roles: AgentTacticalRole[]
) => {
  const role = ctx.squadOrder.assignedRole;
  return role !== undefined && roles.includes(role);
};

export const strayedRatio = (distance: number, ctx: AgentContext) =>
  remap(distance, 0, ctx.config.leaderLeashDistance * 2);

export function fireRangeForWeapon(
  weapon: AgentWeapon,
  config: AgentConfig,
  designated = false,
): number {
  if (!designated) return weapon.engagementRange;
  const baseRange = Math.max(weapon.engagementRange, weapon.preferredRange);
  const scaledRange =
    weapon.engagementRange * config.designatedFireRangeMultiplier;
  return Math.min(baseRange, Math.max(weapon.engagementRange, scaledRange));
}

export function fireRangeForOrder(
  weapon: AgentWeapon,
  config: AgentConfig,
  attackOrder?: AgentAttackOrder | null,
  fireDesignation?: AgentFireDesignation | null,
): number {
  if (attackOrder?.mode === AgentAttackMode.Seek) {
    return Math.max(weapon.engagementRange, weapon.preferredRange);
  }
  if (attackOrder?.mode === AgentAttackMode.Focus || fireDesignation) {
    return fireRangeForWeapon(weapon, config, true);
  }
  return weapon.engagementRange;
}

export function engagementRanges(ctx: AgentContext) {
  const fire = fireRangeForOrder(
    ctx.weapon,
    ctx.config,
    ctx.squadOrder.attackOrder,
    ctx.squadOrder.fireDesignation,
  );
  const standoff = Math.max(fire * 0.92, ctx.config.fightingDistance * 0.9);
  return {
    fire,
    standoff: Math.min(standoff, fire),
    retreat: fire * 0.7,
  };
}

export const isAdvancingWithTarget = (ctx: AgentContext): boolean =>
  ctx.squadOrder.directive === AgentSquadDirective.Advance &&
  ctx.hasAssignedTarget;

export const distanceToRallyPoint = (ctx: AgentContext): number => {
  const rally = ctx.squadOrder.rallyPoint;
  if (!rally) return Infinity;
  return Math.hypot(ctx.position.x - rally.x, ctx.position.z - rally.y);
};

export const FIRETEAM_TACTIC = AgentFireteamTactic;
