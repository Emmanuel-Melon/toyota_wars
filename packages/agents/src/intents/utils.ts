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
  return designated
    ? Math.min(
        weapon.preferredRange,
        weapon.engagementRange * config.designatedFireRangeMultiplier,
      )
    : weapon.engagementRange;
}

export function fireRangeForOrder(
  weapon: AgentWeapon,
  config: AgentConfig,
  attackOrder?: AgentAttackOrder | null,
  fireDesignation?: AgentFireDesignation | null,
): number {
  if (attackOrder?.mode === AgentAttackMode.Seek) return weapon.preferredRange;
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
  return {
    fire,
    standoff: fire * 0.9,
    retreat: fire * 0.65,
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
