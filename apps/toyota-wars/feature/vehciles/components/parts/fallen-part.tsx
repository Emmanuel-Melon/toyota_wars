"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isPartDestroyed } from "@/lib/combat/combat.parts";
import { useVehicleContext } from "../../../../context/vehicle-context";
import { hashUnitId } from "@/feature/vehciles/hooks/use-wreck-visual";
import { easeOutCubic } from "./helpers";
import { PartDebris } from "./part-debris";
import type { FallenPartProps, V3 } from "./types";

const ZERO_V3: V3 = [0, 0, 0];
const DEFAULT_SPIN: V3 = [0.8, 0.6, 1.2];

/**
 * Detaches `children` from the vehicle once the part is destroyed and
 * animates them falling, spinning, and scattering. Renders a static debris
 * visual once they land.
 */
export function FallenPart({
  part,
  position,
  rotation = ZERO_V3,
  drop,
  spin = DEFAULT_SPIN,
  debris,
  debrisColor,
  forceDetach = false,
  scatter = 0,
  children,
}: FallenPartProps) {
  const { partHealth, maxHealth } = useVehicleContext();
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const [landed, setLanded] = useState(false);

  const destroyed =
    forceDetach || isPartDestroyed(partHealth?.[part], part, maxHealth);

  const scatterOffset = useMemo<V3>(
    () =>
      scatter > 0
        ? [
            (hashUnitId(`${part}:scatterX`) - 0.5) * 2 * scatter,
            0,
            (hashUnitId(`${part}:scatterZ`) - 0.5) * 2 * scatter,
          ]
        : [0, 0, 0],
    [part, scatter],
  );

  useEffect(() => {
    if (!destroyed) {
      progress.current = 0;
      setLanded(false);
    }
  }, [destroyed]);

  useFrame((_, delta) => {
    progress.current = THREE.MathUtils.damp(
      progress.current,
      destroyed ? 1 : 0,
      5,
      delta,
    );
    const t = easeOutCubic(progress.current);
    const group = groupRef.current;
    if (group) {
      group.visible = progress.current < 0.94;
      group.position.set(
        position[0] + scatterOffset[0],
        position[1] - drop * t,
        position[2] + scatterOffset[2],
      );
      group.rotation.set(
        rotation[0] + spin[0] * t,
        rotation[1] + spin[1] * t,
        rotation[2] + spin[2] * t,
      );
    }
    if (destroyed && progress.current > 0.76) setLanded(true);
  });

  return (
    <>
      <group ref={groupRef} position={position} rotation={rotation}>
        {children}
      </group>
      {landed && (
        <PartDebris
          kind={debris}
          position={[
            position[0] + scatterOffset[0],
            position[1] - drop,
            position[2] + scatterOffset[2],
          ]}
          rotation={rotation}
          color={debrisColor}
        />
      )}
    </>
  );
}
