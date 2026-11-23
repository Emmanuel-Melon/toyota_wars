// apps/toyota-wars/feature/effects/tracer.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import * as THREE from "three";
import {
  ConeEmitter,
  ConstantColor,
  ConstantValue,
  IntervalValue,
  ParticleSystem,
  RenderMode,
  Vector4,
} from "three.quarks";
import { useQuarksSystemPool } from "@/context/quarks-provider";
import { fadeOverLife, placeSystem, setStartColor } from "../fx-utils";
import { useAdditiveFxMaterial } from "../fx-materials";
import { useFxEvent } from "@/context/fx-context";
import { useGameFrame } from "@/render-loop";
import { getWeaponFx } from "@/lib/fx/fx.config";
import type { EffectProps } from "../effects.types";

const POOL_SIZE = 48;
const ALLY_TRACER = "#ffd27a";
const ENEMY_TRACER = "#ff6b4a";
const STEP = new THREE.Vector3();

type TracerAssignment = {
  slot: number;
  previous: THREE.Vector3;
  travel: number;
  age: number;
  igniteDist: number;
  burnTime: number;
  started: boolean;
};

export function TracerFx({ projectiles, paused }: EffectProps) {
  const cursor = useRef(0);
  const shotCounts = useRef(new Map<string, number>());
  const assignments = useRef(new Map<ParticleSystem, TracerAssignment>());
  const material = useAdditiveFxMaterial();

  const createSystem = useCallback(
    () =>
      new ParticleSystem({
        duration: 4,
        looping: false,
        worldSpace: true,
        shape: new ConeEmitter({ radius: 0.01, angle: 0.02, thickness: 0.5 }),
        emissionOverTime: new ConstantValue(140),
        startLife: new IntervalValue(0.04, 0.08),
        startSpeed: new IntervalValue(4, 4),
        startSize: new IntervalValue(0.12, 0.12),
        startColor: new ConstantColor(new Vector4(1, 0.82, 0.4, 1)),
        renderMode: RenderMode.StretchedBillBoard,
        rendererEmitterSettings: { speedFactor: 0.005, lengthFactor: 1 },
        material,
        behaviors: [fadeOverLife()],
      }),
    [material],
  );

  const systems = useQuarksSystemPool(POOL_SIZE, createSystem, [createSystem]);

  useFxEvent("shot", (event) => {
    const tracer = getWeaponFx(event.weapon).tracer;
    if (!tracer) return;

    const key = `${event.weapon}:${event.barrel}`;
    const count = (shotCounts.current.get(key) ?? 0) + 1;
    shotCounts.current.set(key, count);
    if (count % tracer.every !== 0) return;

    const system = systems[cursor.current++ % systems.length];
    const speedFactor = 0.005;
    const speed = 4;
    system.stop();
    system.duration = Math.max(0.12, tracer.burnTime);
    system.startSize = new IntervalValue(tracer.width, tracer.width);
    system.rendererEmitterSettings = {
      speedFactor,
      lengthFactor:
        (tracer.length / Math.max(tracer.width, 0.02)) * speed * speedFactor,
    };
    setStartColor(
      system,
      tracer.color ?? (event.team === "ally" ? ALLY_TRACER : ENEMY_TRACER),
    );
    placeSystem(system, event.origin, event.direction);
    assignments.current.set(system, {
      slot: event.slot,
      previous: event.origin.clone(),
      travel: 0,
      age: 0,
      igniteDist: tracer.igniteDist,
      burnTime: tracer.burnTime,
      started: false,
    });
  });

  useFxEvent("clear", () => {
    assignments.current.clear();
    for (const system of systems) system.stop();
  });

  useGameFrame((_, delta) => {
    if (paused) return;
    for (const [system, assignment] of assignments.current) {
      const projectile = projectiles[assignment.slot];
      if (!projectile?.active || assignment.age >= assignment.burnTime) {
        system.stop();
        assignments.current.delete(system);
        continue;
      }

      assignment.travel += STEP.subVectors(
        projectile.position,
        assignment.previous,
      ).length();
      assignment.previous.copy(projectile.position);
      assignment.age += delta;
      if (assignment.travel < assignment.igniteDist) continue;

      placeSystem(system, projectile.position, projectile.velocity);
      if (!assignment.started) {
        system.restart();
        assignment.started = true;
      }
    }
  }, "projectiles");

  return null;
}
