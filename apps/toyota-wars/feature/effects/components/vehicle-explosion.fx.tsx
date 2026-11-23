// apps/toyota-wars/feature/effects/vehicle-explosion.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import * as THREE from "three";
import { useQuarksSystemPool } from "../../../context/quarks-provider";
import { placeSystem } from "../fx-utils";
import {
  createExplosionSmoke,
  createFireball,
  createSparks,
  setExplosionScale,
  useExplosionMaterials,
} from "../explosion-recipe";
import { useFxEvent } from "@/context/fx-context";

const POOL_SIZE = 12;
const POSITION = new THREE.Vector3();

export function VehicleExplosionFx() {
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

  useFxEvent("vehicleDestroyed", (event) => {
    const index = cursor.current++ % POOL_SIZE;
    const layers = {
      fireball: fireballs[index],
      smoke: smoke[index],
      sparks: sparks[index],
    };
    setExplosionScale(layers, 1);
    POSITION.copy(event.position);
    POSITION.y += 0.7;
    for (const system of Object.values(layers)) {
      placeSystem(system, POSITION);
      system.restart();
    }
  });

  useFxEvent("clear", () => {
    for (const system of [...fireballs, ...smoke, ...sparks]) system.stop();
  });

  return null;
}
