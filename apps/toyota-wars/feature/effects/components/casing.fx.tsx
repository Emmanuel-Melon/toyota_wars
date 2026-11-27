// apps/toyota-wars/feature/effects/casing.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  ApplyForce,
  ConeEmitter,
  ConstantColor,
  ConstantValue,
  EulerGenerator,
  IntervalValue,
  ParticleSystem,
  RenderMode,
  Rotation3DOverLife,
  Vector3 as QuarkVector3,
  Vector3Function,
  Vector4,
} from "three.quarks";
import { useQuarksSystemPool } from "../../../context/quarks-provider";
import { placeSystem, setStartColor } from "../fx-utils";
import { useCasingFxResources } from "../fx-materials";
import { useArena } from "@/context/arena-context";
import { useFx, useFxEvent } from "@/context/fx-context";
import { useGameFrame } from "@/render-loop";
import { getWeaponFx } from "@/lib/fx/fx.config";
import { WEAPONS, type WeaponId } from "@toyota/combat";
import type { EffectProps } from "../effects.types";

const POOL_SIZE = 160;
const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3();
const UP_AXIS = new THREE.Vector3();
const EJECT = new THREE.Vector3();
const POSITION = new THREE.Vector3();

type Landing = {
  at: number;
  position: THREE.Vector3;
  weapon: WeaponId;
};

export function CasingFx({ paused }: EffectProps) {
  const fx = useFx();
  const arena = useArena();
  const camera = useThree((state) => state.camera);
  const cursor = useRef(0);
  const landings = useRef<Landing[]>([]);
  const { material, geometry } = useCasingFxResources();

  const createSystem = useCallback(
    () =>
      new ParticleSystem({
        duration: 3,
        looping: false,
        worldSpace: true,
        shape: new ConeEmitter({ radius: 0.02, angle: 1.2, thickness: 0.8 }),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [
          {
            time: 0,
            count: new ConstantValue(1),
            cycle: 1,
            interval: 0,
            probability: 1,
          },
        ],
        startLife: new IntervalValue(2.2, 3),
        startSpeed: new IntervalValue(2, 4.5),
        startSize: new Vector3Function(
          new ConstantValue(0.05),
          new ConstantValue(0.14),
          new ConstantValue(0.05),
        ),
        startColor: new ConstantColor(new Vector4(0.85, 0.66, 0.2, 1)),
        instancingGeometry: geometry,
        renderMode: RenderMode.Mesh,
        material,
        behaviors: [
          new ApplyForce(new QuarkVector3(0, -1, 0), new ConstantValue(9.81)),
          new Rotation3DOverLife(
            new EulerGenerator(
              new IntervalValue(-40, 40),
              new IntervalValue(-40, 40),
              new IntervalValue(-40, 40),
            ),
          ),
        ],
      }),
    [geometry, material],
  );

  const systems = useQuarksSystemPool(POOL_SIZE, createSystem, [createSystem]);

  useFxEvent("shot", (event) => {
    const casing = getWeaponFx(event.weapon).casing;
    if (!casing) return;

    RIGHT.crossVectors(event.direction, UP);
    if (RIGHT.lengthSq() < 1e-4) RIGHT.set(1, 0, 0);
    RIGHT.normalize();
    UP_AXIS.crossVectors(RIGHT, event.direction).normalize();

    POSITION.copy(event.origin)
      .addScaledVector(event.direction, -casing.port[2])
      .addScaledVector(RIGHT, casing.port[0])
      .addScaledVector(UP_AXIS, casing.port[1]);
    EJECT.copy(RIGHT)
      .multiplyScalar(casing.eject)
      .addScaledVector(UP_AXIS, 1.8)
      .addScaledVector(event.direction, -0.6)
      .normalize();

    const ground = arena.terrain.getHeight(POSITION.x, POSITION.z);
    const fall = Math.max(0, POSITION.y - ground);
    const fallTime = Math.sqrt((2 * fall) / 9.81);
    if (camera.position.distanceToSquared(POSITION) > 70 * 70) return;

    const system = systems[cursor.current++ % systems.length];
    const width = casing.radius * 2 * 2.5;
    const length = casing.length * 2.5;
    system.duration = Math.max(0.5, fallTime + 0.5);
    system.startLife = new IntervalValue(
      Math.max(0.6, fallTime + 0.2),
      Math.max(0.8, fallTime + 0.5),
    );
    system.startSize = new Vector3Function(
      new ConstantValue(width),
      new ConstantValue(length),
      new ConstantValue(width),
    );
    setStartColor(system, casing.color);
    placeSystem(system, POSITION, EJECT);
    system.restart();

    landings.current.push({
      at: performance.now() / 1000 + fallTime,
      position: POSITION.clone(),
      weapon: event.weapon,
    });
  });

  useFxEvent("clear", () => {
    landings.current = [];
    for (const system of systems) system.stop();
  });

  useGameFrame(() => {
    if (paused || landings.current.length === 0) return;
    const now = performance.now() / 1000;
    const pending = landings.current;
    landings.current = [];
    for (const landing of pending) {
      if (landing.at <= now) {
        fx.emit("casingLand", {
          position: landing.position,
          weapon: landing.weapon,
        });
      } else {
        landings.current.push(landing);
      }
    }
  }, "projectiles");

  return null;
}
