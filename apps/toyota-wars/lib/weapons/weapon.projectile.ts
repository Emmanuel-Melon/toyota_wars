import * as THREE from "three";
import { outOfBounds, intersectSegmentSphere } from "../collision/collision";
import { markCombatActivity } from "../combat/combat.activity";
import type { VehiclePart } from "../combat/combat.teams";
import type {
  EnemyTarget,
  FireRequest,
  HealthMap,
  ProjectileExplosionEvent,
  Team,
} from "../combat/combat.types";
import { applyBulletSpread } from "../ballistics/ballistics";
import type { TerrainSampler } from "../map/map.terrain";
import type { Obstacle } from "../movement/movement.types";
import { DEFAULT_WEAPON_ID, WEAPONS } from "./weapon.config";
import { applyMuzzleOffset, weaponDirection } from "./weapon.math";
import { earliestRockHit, isRockOccluded } from "./weapon.obstacles";
import type { WeaponExplosionSpec, WeaponId } from "./weapon.types";

export type ProjectileSlot = {
  active: boolean;
  weapon: WeaponId;
  team: Team;
  source: FireRequest["source"];
  damageScale: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  whizzPlayed: boolean;
};

export type ProjectileStepContext = {
  targets: readonly EnemyTarget[];
  health: HealthMap;
  getHealth: (id: string) => number;
  terrain: TerrainSampler;
  obstacles: readonly Obstacle[];
  onHit: (
    id: string,
    part: VehiclePart,
    damage: number,
    source: FireRequest["source"],
  ) => void;
  onKill: (team: Team, id: string) => void;
  onExplode: (event: ProjectileExplosionEvent) => void;
  listener?: Readonly<THREE.Vector3>;
  onWhizz?: (point: THREE.Vector3) => void;
  onObstacleHit?: (point: THREE.Vector3) => void;
  onImpact?: (event: {
    point: THREE.Vector3;
    direction: THREE.Vector3;
    part: string;
    weapon: ProjectileSlot["weapon"];
    team: ProjectileSlot["team"];
    source: ProjectileSlot["source"];
  }) => void;
};

const WHIZZ_RADIUS = 6;
const WHIZZ_RADIUS_SQ = WHIZZ_RADIUS * WHIZZ_RADIUS;

const spawnDirection = new THREE.Vector3();
const previousPosition = new THREE.Vector3();
const targetCenter = new THREE.Vector3();
const detonationPoint = new THREE.Vector3();
const whizzDelta = new THREE.Vector3();
const whizzToListener = new THREE.Vector3();
const whizzClosest = new THREE.Vector3();
const impactDirection = new THREE.Vector3();

function healthOf(context: ProjectileStepContext, id: string): number {
  return context.getHealth(id);
}

function worldPartCenter(
  out: THREE.Vector3,
  target: EnemyTarget,
  offset: readonly [number, number, number],
): THREE.Vector3 {
  const heading = target.heading ?? 0;
  const cos = Math.cos(heading);
  const sin = Math.sin(heading);
  return out.set(
    target.position[0] + offset[0] * cos + offset[2] * sin,
    target.position[1] + offset[1],
    target.position[2] - offset[0] * sin + offset[2] * cos,
  );
}

function nearestPart(
  target: EnemyTarget,
  point: THREE.Vector3,
): { part: VehiclePart; distance: number } {
  let bestPart: VehiclePart = "body";
  let bestDistance = Infinity;
  for (const part of target.parts) {
    worldPartCenter(targetCenter, target, part.offset);
    const distance = point.distanceTo(targetCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPart = part.part;
    }
  }
  return { part: bestPart, distance: bestDistance };
}

function segmentPoint(
  out: THREE.Vector3,
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number,
): THREE.Vector3 {
  return out.copy(from).lerp(to, t);
}

function emitImpact(
  context: ProjectileStepContext,
  projectile: ProjectileSlot,
  point: THREE.Vector3,
  part: string,
): void {
  context.onImpact?.({
    point: point.clone(),
    direction: impactDirection.copy(projectile.velocity).normalize().clone(),
    part,
    weapon: projectile.weapon,
    team: projectile.team,
    source: projectile.source,
  });
}

function closestPointOnSegment(
  from: THREE.Vector3,
  to: THREE.Vector3,
  point: Readonly<THREE.Vector3>,
): THREE.Vector3 {
  whizzDelta.subVectors(to, from);
  const lengthSq = whizzDelta.lengthSq();
  const t =
    lengthSq > 0
      ? THREE.MathUtils.clamp(
          whizzToListener.subVectors(point, from).dot(whizzDelta) / lengthSq,
          0,
          1,
        )
      : 0;
  return whizzClosest.copy(from).addScaledVector(whizzDelta, t);
}

function groundCrossingT(
  from: THREE.Vector3,
  to: THREE.Vector3,
  terrain: TerrainSampler,
): number | null {
  const fromClearance = from.y - terrain.getHeight(from.x, from.z);
  const toClearance = to.y - terrain.getHeight(to.x, to.z);
  if (fromClearance <= 0) return 0;
  if (toClearance > 0) return null;

  const drop = fromClearance - toClearance;
  return drop > 0 ? THREE.MathUtils.clamp(fromClearance / drop, 0, 1) : 1;
}

function applyExplosionDamage(
  context: ProjectileStepContext,
  projectile: ProjectileSlot,
  explosion: WeaponExplosionSpec,
  point: THREE.Vector3,
  directId: string | null,
  directPart: VehiclePart,
): void {
  const baseDamage = explosion.damage * projectile.damageScale;
  const damaged = new Map<string, { part: VehiclePart; damage: number }>();

  for (const target of context.targets) {
    if (!explosion.friendlyFire && target.team === projectile.team) continue;
    if (healthOf(context, target.id) <= 0) continue;

    const nearest = nearestPart(target, point);
    if (isRockOccluded(point, targetCenter, context.obstacles)) continue;
    const distance = nearest.distance;
    if (distance > explosion.radius) continue;

    const falloff = Math.max(
      explosion.minDamageRatio,
      1 - (distance / explosion.radius) * (1 - explosion.minDamageRatio),
    );
    const damage =
      target.id === directId && distance < explosion.radius * 0.25
        ? baseDamage
        : baseDamage * falloff;

    damaged.set(target.id, {
      part: target.id === directId ? directPart : nearest.part,
      damage,
    });
  }

  for (const [id, hit] of damaged) {
    markCombatActivity();
    if (healthOf(context, id) - hit.damage <= 0) {
      context.onKill(projectile.team, id);
    }
    context.onHit(id, hit.part, hit.damage, projectile.source);
  }
}

export const DEFAULT_PROJECTILE_POOL_SIZE = 200;

export function createProjectilePool(
  size = DEFAULT_PROJECTILE_POOL_SIZE,
): ProjectileSlot[] {
  return Array.from({ length: size }, () => ({
    active: false,
    weapon: DEFAULT_WEAPON_ID,
    team: "ally",
    source: "ai",
    damageScale: 1,
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    life: 0,
    whizzPlayed: false,
  }));
}

export function spawnProjectile(
  pool: readonly ProjectileSlot[],
  request: FireRequest,
): ProjectileSlot | null {
  const config = WEAPONS[request.weapon];
  const slot = pool.find((projectile) => !projectile.active);
  if (!slot) return null;

  const spread = request.spread ?? config.spread;
  const direction = request.worldMuzzle
    ? spawnDirection.copy(request.worldMuzzle.direction)
    : weaponDirection(request.angle, request.pitch ?? 0, spawnDirection);
  applyBulletSpread(direction, spread);

  slot.active = true;
  slot.weapon = request.weapon;
  slot.team = request.team;
  slot.source = request.source;
  slot.damageScale = request.damageScale ?? 1;
  slot.life = config.projectile.life;
  slot.whizzPlayed = false;
  if (request.worldMuzzle) {
    slot.position.copy(request.worldMuzzle.position);
  } else {
    applyMuzzleOffset(request.startPos, direction, config, slot.position);
  }
  slot.velocity.copy(direction).multiplyScalar(config.projectile.speed);
  return slot;
}

export function stepProjectiles(
  projectiles: readonly ProjectileSlot[],
  delta: number,
  context: ProjectileStepContext,
  bounds: number,
): void {
  const list = context.targets;

  for (const projectile of projectiles) {
    if (!projectile.active) continue;

    const config = WEAPONS[projectile.weapon];
    const gravity = config.projectile.gravity ?? 0;
    const drag = config.projectile.drag ?? 0;
    const damage = config.projectile.damage * projectile.damageScale;

    previousPosition.copy(projectile.position);
    projectile.velocity.y -= gravity * delta;
    if (drag > 0) {
      projectile.velocity.multiplyScalar(Math.exp(-drag * delta));
    }
    projectile.position.addScaledVector(projectile.velocity, delta);
    projectile.life -= delta;

    if (
      !projectile.whizzPlayed &&
      projectile.team === "enemy" &&
      context.listener &&
      context.onWhizz &&
      closestPointOnSegment(
        previousPosition,
        projectile.position,
        context.listener,
      ).distanceToSquared(context.listener) < WHIZZ_RADIUS_SQ
    ) {
      projectile.whizzPlayed = true;
      context.onWhizz(whizzClosest.clone());
    }

    const obstacleT = earliestRockHit(
      previousPosition,
      projectile.position,
      context.obstacles,
    );

    if (!config.explosion) {
      let hitId: string | null = null;
      let hitPart: VehiclePart = "body";
      let bestT = Infinity;
      let bestPriority = -Infinity;

      for (const target of list) {
        if (target.team === projectile.team) continue;
        if (healthOf(context, target.id) <= 0) continue;

        for (const part of target.parts) {
          worldPartCenter(targetCenter, target, part.offset);
          // Consuming shared collision intersection utility
          const t = intersectSegmentSphere(
            previousPosition,
            projectile.position,
            targetCenter,
            part.radius,
          );
          const priority = part.priority ?? 0;
          if (
            t !== null &&
            (priority > bestPriority ||
              (priority === bestPriority && t < bestT))
          ) {
            bestT = t;
            bestPriority = priority;
            hitId = target.id;
            hitPart = part.part;
          }
        }
      }

      const groundT = groundCrossingT(
        previousPosition,
        projectile.position,
        context.terrain,
      );
      const environmentT = Math.min(groundT ?? Infinity, obstacleT ?? Infinity);
      if (Number.isFinite(environmentT) && environmentT < bestT) {
        segmentPoint(
          detonationPoint,
          previousPosition,
          projectile.position,
          environmentT,
        );
        projectile.position.copy(detonationPoint);
        if (groundT !== null && groundT <= (obstacleT ?? Infinity)) {
          projectile.position.y = context.terrain.getHeight(
            projectile.position.x,
            projectile.position.z,
          );
          emitImpact(context, projectile, projectile.position, "ground");
        } else {
          emitImpact(context, projectile, detonationPoint, "rock");
          context.onObstacleHit?.(detonationPoint.clone());
        }
        projectile.active = false;
        continue;
      }

      if (hitId) {
        segmentPoint(
          detonationPoint,
          previousPosition,
          projectile.position,
          bestT,
        );
        emitImpact(context, projectile, detonationPoint, hitPart);
        markCombatActivity();
        if (healthOf(context, hitId) - damage <= 0) {
          context.onKill(projectile.team, hitId);
        }
        context.onHit(hitId, hitPart, damage, projectile.source);
        projectile.active = false;
        continue;
      }

      const groundY = context.terrain.getHeight(
        projectile.position.x,
        projectile.position.z,
      );
      if (projectile.position.y <= groundY) {
        projectile.position.y = groundY;
        projectile.active = false;
        continue;
      }
      if (projectile.life <= 0 || outOfBounds(projectile.position, bounds)) {
        projectile.active = false;
      }
      continue;
    }

    const explosion = config.explosion;
    let directId: string | null = null;
    let directPart: VehiclePart = "body";
    let directT = Infinity;
    let directPriority = -Infinity;
    let nearT = Infinity;

    for (const target of list) {
      if (!explosion.friendlyFire && target.team === projectile.team) continue;
      if (healthOf(context, target.id) <= 0) continue;

      for (const part of target.parts) {
        worldPartCenter(targetCenter, target, part.offset);
        const t = intersectSegmentSphere(
          previousPosition,
          projectile.position,
          targetCenter,
          part.radius,
        );
        const priority = part.priority ?? 0;
        if (
          t !== null &&
          (priority > directPriority ||
            (priority === directPriority && t < directT))
        ) {
          directT = t;
          directPriority = priority;
          directId = target.id;
          directPart = part.part;
        }
      }

      worldPartCenter(targetCenter, target, [0, 0.65, 0]);
      const proximityT = intersectSegmentSphere(
        previousPosition,
        projectile.position,
        targetCenter,
        explosion.triggerRadius,
      );
      if (proximityT !== null && proximityT < nearT) {
        nearT = proximityT;
      }
    }

    const groundT = groundCrossingT(
      previousPosition,
      projectile.position,
      context.terrain,
    );
    const detonationT = Math.min(
      directT,
      nearT,
      groundT ?? Infinity,
      obstacleT ?? Infinity,
    );

    if (Number.isFinite(detonationT)) {
      segmentPoint(
        detonationPoint,
        previousPosition,
        projectile.position,
        detonationT,
      );
      projectile.position.copy(detonationPoint);
      if (obstacleT !== null && detonationT === obstacleT) {
        context.onObstacleHit?.(detonationPoint.clone());
      }
      const isDirect = detonationT === directT && directId !== null;
      applyExplosionDamage(
        context,
        projectile,
        explosion,
        detonationPoint,
        isDirect ? directId : null,
        directPart,
      );
    } else if (
      projectile.life <= 0 ||
      outOfBounds(projectile.position, bounds)
    ) {
      detonationPoint.copy(projectile.position);
      applyExplosionDamage(
        context,
        projectile,
        explosion,
        detonationPoint,
        null,
        "body",
      );
    } else {
      continue;
    }

    context.onExplode({
      weapon: projectile.weapon,
      team: projectile.team,
      position: detonationPoint.clone(),
    });
    projectile.active = false;
  }
}
