// apps/toyota-wars/feature/effects/projectile-explosion.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import * as THREE from "three";
import { useQuarksSystemPool } from "@/context/quarks-provider";
import { placeSystem } from "../fx-utils";
import {
  createExplosionSmoke,
  createFireball,
  createSparks,
  setExplosionScale,
  useExplosionMaterials,
} from "../explosion-recipe";
import { useFxEvent } from "@/context/fx-context";
import { useGameFrame } from "@/render-loop";
import {
  addSmokeCloud,
  clearSmokeClouds,
  tickSmokeClouds,
} from "@toyota/combat";
import { getWeaponFx } from "@/lib/fx/fx.config";
import type { EffectProps } from "../effects.types";

const POOL_SIZE = 12;

export function ProjectileExplosionFx({ paused }: EffectProps) {
  const cursor = useRef(0);
  const materials = useExplosionMaterials();

  const createFireballSystem = useCallback(
    () => createFireball(materials.fireball),
    [materials],
  );
  const createSmokeSystem = useCallback(
    () => createExplosionSmoke(materials.smoke),
    [materials],
  );
  const createSparkSystem = useCallback(
    () => createSparks(materials.sparks),
    [materials],
  );

  const fireballs = useQuarksSystemPool(POOL_SIZE, createFireballSystem, [
    createFireballSystem,
  ]);
  const smoke = useQuarksSystemPool(POOL_SIZE, createSmokeSystem, [
    createSmokeSystem,
  ]);
  const sparks = useQuarksSystemPool(POOL_SIZE, createSparkSystem, [
    createSparkSystem,
  ]);

  useFxEvent("explosion", (event) => {
    const spec = getWeaponFx(event.weapon).explosion;
    if (!spec) return;

    const index = cursor.current++ % POOL_SIZE;
    const layers = {
      fireball: fireballs[index],
      smoke: smoke[index],
      sparks: sparks[index],
    };

    setExplosionScale(layers, spec.scale);
    layers.fireball.duration = spec.fireDuration;
    layers.sparks.duration = 1.5;
    if (spec.smoke) layers.smoke.duration = spec.smoke.lifetime;
    materials.fireball.color.set(spec.color);
    materials.sparks.color.set(spec.color);

    const activeSystems = spec.smoke
      ? Object.values(layers)
      : [layers.fireball, layers.sparks];
    for (const system of activeSystems) {
      placeSystem(system, event.position);
      system.restart();
    }

    if (spec.smoke) {
      addSmokeCloud({
        position: event.position.clone().add(new THREE.Vector3(0, 0.6, 0)),
        radius: spec.smoke.radius,
        height: spec.smoke.height,
        remaining: spec.smoke.lifetime,
        team: event.team,
      });
    }
  });

  useFxEvent("clear", () => {
    clearSmokeClouds();
    for (const system of [...fireballs, ...smoke, ...sparks]) system.stop();
  });

  useGameFrame((_, delta) => {
    if (!paused) tickSmokeClouds(delta);
  }, "projectiles");

  return null;
}
