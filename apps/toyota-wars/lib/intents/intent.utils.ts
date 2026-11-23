// lib/tanks/intents/intent.utils.ts
// Considerations and helpers reused across intents.
import { curves, remap } from "@/lib/selector/math";
import type { Consideration } from "@/lib/selector/types";
import {
  ALLY_ATTACK_MODE,
  SQUAD_DIRECTIVE,
  type AllyAttackOrder,
  type FireDesignation,
  type SquadDirective,
  type TacticalRole,
} from "@/lib/squad/squad.types";
import type { FireteamTactic } from "@/lib/meso/meso.types";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import type { TankContext } from "@/lib/tanks/tanks.types";
import type { WeaponConfig } from "@/lib/weapons/weapon.types";

/** Gate: 1 when a target is assigned, 0 (veto) otherwise. */
export const hasTarget: Consideration<TankContext> = {
  name: "hasTarget",
  input: (ctx) => (ctx.targetPosition ? 1 : 0),
  curve: curves.step(1),
};

export const gatedOn = <C>(
  name: string,
  predicate: (ctx: C) => boolean,
): Consideration<C> => ({
  name,
  input: (ctx) => (predicate(ctx) ? 1 : 0),
  curve: curves.step(1),
});

export const whenRole = (
  ...roles: TacticalRole[]
): Consideration<TankContext> =>
  gatedOn<TankContext>("role", (ctx) => hasSquadRole(ctx, ...roles));

export const whenNotRole = (
  ...roles: TacticalRole[]
): Consideration<TankContext> =>
  gatedOn<TankContext>("notRole", (ctx) => !hasSquadRole(ctx, ...roles));

export const whenDirective = (
  ...directives: SquadDirective[]
): Consideration<TankContext> =>
  gatedOn<TankContext>("directive", (ctx) =>
    directives.includes(ctx.squadOrder.directive),
  );

export const whenLineOfSightClear: Consideration<TankContext> = gatedOn(
  "lineOfSightClear",
  (ctx) => ctx.lineOfSightClear,
);

export const whenLineOfSightBlocked: Consideration<TankContext> = gatedOn(
  "lineOfSightBlocked",
  (ctx) => !ctx.lineOfSightClear,
);

const tacticOf = (ctx: TankContext): FireteamTactic =>
  ctx.squadOrder.fireteamTactic;

export const whenNotTactic = (
  ...tactics: FireteamTactic[]
): Consideration<TankContext> =>
  gatedOn<TankContext>(
    "notFireteamTactic",
    (ctx) => !tactics.includes(tacticOf(ctx)),
  );

/** True when the squad order assigns this unit one of the given roles. */
export const hasSquadRole = (
  ctx: TankContext,
  ...roles: NonNullable<TankContext["squadOrder"]>["assignedRole"][]
) => {
  const role = ctx.squadOrder?.assignedRole;
  return role !== undefined && roles.includes(role);
};

/** 0..1: how far a distance is past the leash (1 = twice the leash or more). */
export const strayedRatio = (distance: number, ctx: TankContext) =>
  remap(distance, 0, ctx.leaderLeashDistance * 2);

export function fireRangeForWeapon(
  weapon: WeaponConfig,
  designated = false,
): number {
  return designated
    ? Math.min(
        weapon.preferredRange,
        weapon.engagementRange * SQUAD_CONFIG.designatedFireRangeMultiplier,
      )
    : weapon.engagementRange;
}

export function fireRangeForOrder(
  weapon: WeaponConfig,
  attackOrder?: AllyAttackOrder | null,
  fireDesignation?: FireDesignation | null,
): number {
  if (attackOrder?.mode === ALLY_ATTACK_MODE.SEEK) return weapon.preferredRange;
  if (attackOrder?.mode === ALLY_ATTACK_MODE.FOCUS || fireDesignation) {
    return fireRangeForWeapon(weapon, true);
  }
  return weapon.engagementRange;
}

export function engagementRanges(ctx: TankContext) {
  const fire = fireRangeForOrder(
    ctx.weapon,
    ctx.squadOrder.attackOrder,
    ctx.squadOrder.fireDesignation,
  );
  return {
    fire,
    standoff: fire * 0.9,
    retreat: fire * 0.65,
  };
}

export const isAdvancingWithTarget = (ctx: TankContext): boolean =>
  ctx.squadOrder.directive === SQUAD_DIRECTIVE.ADVANCE &&
  Boolean(ctx.targetPosition);

/**
 * Ground-plane (x/z) distance to the squad rally point; Infinity if none.
 * Assumes ctx.position and rallyPoint both expose x and z.
 */
type GroundPoint = { x: number; y: number } | { x: number; z: number };

/** Ground-plane depth axis: z for 3D points, y for Point2D. */
const groundDepth = (p: GroundPoint) => ("z" in p ? p.z : p.y);

/**
 * Ground-plane distance to the squad rally point; Infinity if none.
 * Works for both Point2D ({x, y}) and Vector3-style ({x, z}) points.
 */
export const distanceToRallyPoint = (ctx: TankContext): number => {
  const rally = ctx.squadOrder?.rallyPoint;
  if (!rally) return Infinity;
  return Math.hypot(
    ctx.position.x - rally.x,
    groundDepth(ctx.position) - groundDepth(rally),
  );
};
