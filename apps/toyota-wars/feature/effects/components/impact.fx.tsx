// apps/toyota-wars/feature/effects/impact.fx.tsx
"use client";

import { useCallback, useRef } from "react";
import {
  ConstantColor,
  ConstantValue,
  IntervalValue,
  ParticleSystem,
  SphereEmitter,
  Vector4,
} from "three.quarks";

import { useFxEvent } from "@/context/fx-context";
import { useAdditiveFxMaterial } from "../fx-materials";
import { fadeOverLife, placeSystem, setStartColor } from "../fx-utils";
import { useQuarksSystemPool } from "@/context/quarks-provider";

const POOL_SIZE = 24;

export function ImpactFx() {
  const cursor = useRef(0);
  const material = useAdditiveFxMaterial();

  const createSystem = useCallback(
    () =>
      new ParticleSystem({
        duration: 0.5,
        looping: false,
        worldSpace: true,
        shape: new SphereEmitter({ radius: 0.08, thickness: 0.4 }),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [
          {
            time: 0,
            count: new ConstantValue(20),
            cycle: 1,
            interval: 0,
            probability: 1,
          },
        ],
        startLife: new IntervalValue(0.16, 0.42),
        startSpeed: new IntervalValue(1.5, 6),
        startSize: new IntervalValue(0.035, 0.11),
        startColor: new ConstantColor(new Vector4(1, 0.8, 0.4, 1)),
        material,
        behaviors: [fadeOverLife()],
      }),
    [material],
  );

  const systems = useQuarksSystemPool(POOL_SIZE, createSystem, [createSystem]);

  useFxEvent("impact", (event) => {
    const color =
      event.part === "rock"
        ? "#c2ad8c"
        : event.part === "ground"
          ? "#9a7a50"
          : "#ffcc66";
    const system = systems[cursor.current++ % systems.length];
    setStartColor(system, color);
    placeSystem(system, event.point, event.direction.clone().negate());
    system.restart();
  });

  useFxEvent("clear", () => {
    for (const system of systems) system.stop();
  });

  return null;
}
