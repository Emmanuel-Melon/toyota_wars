// apps/toyota-wars/feature/weapons/components/projectile-system.tsx
"use client";

import { useImperativeHandle, useRef, type RefObject } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import { useFx } from "@/context/fx-context";
import { EffectsHost } from "@/feature/effects/components/effects-host";
import {
  createProjectilePool,
  spawnProjectile,
  stepProjectiles,
} from "@/lib/weapons/weapon.projectile";
import { DEFAULT_MUZZLES, WEAPONS } from "@/lib/weapons/weapon.config";
import type {
  EnemyTarget,
  FireRequest,
  HealthMap,
  ProjectileSystemHandle,
  Team,
} from "@/lib/combat/combat.types";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import { useArena } from "@/context/arena-context";
import { markCombatActivity } from "@/lib/combat/combat.activity";
const MUZZLE_UP = new THREE.Vector3(0, 1, 0);
const muzzleRight = new THREE.Vector3();

export function ProjectileSystem({
  targets,
  health,
  getHealth,
  onHit, // (unitId, part, damage, source) => void
  onKill, // (killerTeam, unitId) => void
  listener,
  paused,
  systemRef,
}: {
  targets: RefObject<readonly EnemyTarget[]>; // live list, owned by BattleProvider/PositionTracker
  health: HealthMap;
  getHealth: (id: string) => number;
  onHit: (
    id: string,
    part: VehiclePart,
    damage: number,
    source: FireRequest["source"],
  ) => void;
  onKill: (team: Team, id: string) => void;
  listener: Readonly<THREE.Vector3>;
  paused: boolean;
  systemRef: RefObject<ProjectileSystemHandle | null>;
}) {
  const projectiles = useRef(createProjectilePool());
  const arena = useArena();
  const fx = useFx();

  useImperativeHandle(systemRef, () => ({
    fire(request) {
      const configuredMuzzles = WEAPONS[request.weapon].muzzles;
      const muzzleOffsets = configuredMuzzles?.length
        ? configuredMuzzles
        : DEFAULT_MUZZLES;
      const barrel = THREE.MathUtils.clamp(
        request.barrel ?? 0,
        0,
        muzzleOffsets.length - 1,
      );
      const projectile = spawnProjectile(projectiles.current, request);
      if (!projectile) return;

      markCombatActivity();

      const offset = muzzleOffsets[barrel];
      muzzleRight.crossVectors(projectile.velocity, MUZZLE_UP);
      if (muzzleRight.lengthSq() < 1e-6) {
        muzzleRight.set(1, 0, 0);
      } else {
        muzzleRight.normalize();
      }
      projectile.position.addScaledVector(muzzleRight, offset.right);
      if (offset.up) projectile.position.y += offset.up;

      fx.emit("shot", {
        slot: projectiles.current.indexOf(projectile),
        barrel,
        weapon: request.weapon,
        team: request.team,
        source: request.source,
        origin: projectile.position.clone(),
        direction: projectile.velocity.clone().normalize(),
      });
    },
    clear() {
      for (const projectile of projectiles.current) {
        projectile.active = false;
      }
      fx.emit("clear", {});
    },
  }));

  useGameFrame((_, delta) => {
    if (paused) return;

    stepProjectiles(
      projectiles.current,
      delta,
      {
        targets: targets.current ?? [],
        health,
        getHealth,
        terrain: arena.terrain,
        obstacles: arena.obstacles,
        onHit,
        onKill,
        onExplode: (event) => {
          fx.emit("explosion", event);
        },
        listener,
        onWhizz: (point) => fx.emit("whizz", { point }),
        onObstacleHit: (point) => fx.emit("obstacleHit", { point }),
        onImpact: (event) => {
          fx.emit("impact", event);
        },
      },
      arena.bound,
    );
  }, "projectiles");

  return (
    <group name="projectiles">
      <EffectsHost projectiles={projectiles.current} paused={paused} />
    </group>
  );
}
