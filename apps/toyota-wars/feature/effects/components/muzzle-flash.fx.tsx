// apps/toyota-wars/feature/effects/muzzle-flash.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import {
  ConeEmitter,
  ConstantColor,
  ConstantValue,
  IntervalValue,
  ParticleSystem,
  Vector4,
} from "three.quarks";
import { useQuarksSystemPool } from "../../../context/quarks-provider";
import { fadeOverLife, placeSystem, setStartColor } from "../fx-utils";
import { useAdditiveFxMaterial } from "../fx-materials";
import { useFxEvent } from "@/context/fx-context";
import { getWeaponFx } from "@/lib/fx/fx.config";

const POOL_SIZE = 24;

export function MuzzleFlashFx() {
  const cursor = useRef(0);
  const material = useAdditiveFxMaterial();

  const createSystem = useCallback(
    () =>
      new ParticleSystem({
        duration: 0.16,
        looping: false,
        worldSpace: true,
        shape: new ConeEmitter({ radius: 0.05, angle: 0.4, thickness: 0.6 }),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [
          {
            time: 0,
            count: new ConstantValue(18),
            cycle: 1,
            interval: 0,
            probability: 1,
          },
        ],
        startLife: new IntervalValue(0.03, 0.09),
        startSpeed: new IntervalValue(3, 10),
        startSize: new IntervalValue(0.08, 0.22),
        startColor: new ConstantColor(new Vector4(1, 0.8, 0.3, 1)),
        material,
        behaviors: [fadeOverLife()],
      }),
    [material],
  );

  const systems = useQuarksSystemPool(POOL_SIZE, createSystem, [createSystem]);

  useFxEvent("shot", (event) => {
    const flash = getWeaponFx(event.weapon).muzzleFlash;
    if (!flash) return;

    const system = systems[cursor.current++ % systems.length];
    system.duration = flash.duration;
    system.startSize = new IntervalValue(flash.size * 0.5, flash.size);
    setStartColor(system, flash.color);
    placeSystem(system, event.origin, event.direction);
    system.restart();
  });

  useFxEvent("clear", () => {
    for (const system of systems) system.stop();
  });

  return null;
}
