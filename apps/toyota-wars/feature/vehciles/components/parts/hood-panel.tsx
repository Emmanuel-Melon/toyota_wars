"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useVehicleContext } from "@/context/vehicle-context";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { partHealthRatio } from "@/lib/combat/combat.parts";
import { createHoodGeometry } from "@/feature/vehciles/pickup.geometry";
import { getVehicleNumberTexture } from "@/feature/vehciles/vehicle-number.texture";
import { vehicleNumberForUnitId } from "@/lib/vehicle-identity";
import { FallenPart } from "./fallen-part";

const SCORCH_MARKS: readonly { x: number; z: number; size: number }[] = [
  { x: -0.38, z: 1.62, size: 0.24 },
  { x: 0.3, z: 2.02, size: 0.32 },
  { x: -0.08, z: 2.34, size: 0.2 },
];

function hoodSurfaceY(z: number) {
  return 0.84 + ((z - 1.25) * (0.66 - 0.84)) / (2.58 - 1.25);
}

const HOOD_NUMBER_Z = 1.95;
const HOOD_NUMBER_TILT = Math.atan2(0.18, 1.33);

export function HoodPanel({ paintMat }: { paintMat: THREE.Material }) {
  const { health, maxHealth, partHealth, team, unitId } = useVehicleContext();
  const hood = useMemo(createHoodGeometry, []);
  const vehicleNumber = vehicleNumberForUnitId(unitId);
  const numberTexture = useMemo(
    () => getVehicleNumberTexture(vehicleNumber),
    [vehicleNumber],
  );
  const scorchMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#100c08",
        roughness: 1,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );

  const partRatio = partHealthRatio(partHealth?.hood, "hood", maxHealth);
  const totalRatio = Math.max(0, Math.min(1, health / maxHealth));
  const threshold = COMBAT_CONFIG.PLAYER_DAMAGE_SMOKE_HEALTH_FRACTION;
  const thresholdDamage =
    totalRatio <= threshold
      ? 0.35 + 0.65 * ((threshold - totalRatio) / threshold)
      : 0;
  const damage = Math.min(1, Math.max(1 - partRatio, thresholdDamage));

  useEffect(() => {
    scorchMat.opacity = damage > 0.01 ? 0.2 + damage * 0.55 : 0;
  }, [damage, scorchMat]);

  useEffect(
    () => () => {
      hood.dispose();
      scorchMat.dispose();
    },
    [hood, scorchMat],
  );

  return (
    <FallenPart
      part="hood"
      position={[0, 0, 0]}
      drop={1.7}
      spin={[0.5, 0.9, 1.3]}
      debris="hood"
      debrisColor="#4a4238"
      scatter={0.3}
    >
      <group
        position={[0, -damage * 0.012, 0]}
        rotation={[damage * 0.02, 0, damage * 0.025]}
      >
        <mesh geometry={hood} material={paintMat} castShadow />
        <group
          position={[0, hoodSurfaceY(HOOD_NUMBER_Z) + 0.06, HOOD_NUMBER_Z]}
          rotation={[-Math.PI / 2 + HOOD_NUMBER_TILT, 0, 0]}
        >
          <mesh rotation={[0, 0, Math.PI]}>
            <planeGeometry args={[0.55, 0.3]} />
            <meshBasicMaterial
              map={numberTexture}
              color={team === "ally" ? "#20261d" : "#d9d5c2"}
              transparent
              alphaTest={0.08}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              toneMapped={false}
            />
          </mesh>
        </group>
        {SCORCH_MARKS.map(({ x, z, size }) => (
          <mesh
            key={`${x}:${z}`}
            position={[x, hoodSurfaceY(z) + 0.055, z]}
            scale={[size, 0.018, size * 0.65]}
            material={scorchMat}
            visible={damage > 0.01}
          >
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        ))}
      </group>
    </FallenPart>
  );
}
