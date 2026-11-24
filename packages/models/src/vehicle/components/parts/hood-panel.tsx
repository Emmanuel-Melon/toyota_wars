"use client";

import { useEffect, useMemo } from "react";
import type { HoodPanelVisualProps } from "../../types";
import { createHoodGeometry } from "../../geometry/pickup";

const scorchMarks = [
  { x: -0.38, z: 1.62, size: 0.24 },
  { x: 0.3, z: 2.02, size: 0.32 },
  { x: -0.08, z: 2.34, size: 0.2 },
] as const;

function hoodSurfaceY(z: number) {
  return 0.84 + ((z - 1.25) * (0.66 - 0.84)) / (2.58 - 1.25);
}

const numberZ = 1.95;
const numberTilt = Math.atan2(0.18, 1.33);

export function HoodPanelVisual({
  paintMat,
  damage = 0,
  numberTexture,
  numberColor = "#20261d",
}: HoodPanelVisualProps) {
  const hood = useMemo(createHoodGeometry, []);
  useEffect(() => () => hood.dispose(), [hood]);
  const scorchOpacity = damage > 0.01 ? 0.2 + damage * 0.55 : 0;

  return (
    <group
      position={[0, -damage * 0.012, 0]}
      rotation={[damage * 0.02, 0, damage * 0.025]}
    >
      <mesh geometry={hood} material={paintMat} castShadow />
      {numberTexture && (
        <group
          position={[0, hoodSurfaceY(numberZ) + 0.06, numberZ]}
          rotation={[-Math.PI / 2 + numberTilt, 0, 0]}
        >
          <mesh rotation={[0, 0, Math.PI]}>
            <planeGeometry args={[0.55, 0.3]} />
            <meshBasicMaterial
              map={numberTexture}
              color={numberColor}
              transparent
              alphaTest={0.08}
              depthWrite={false}
              polygonOffset
              polygonOffsetFactor={-2}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
      {scorchMarks.map(({ x, z, size }) => (
        <mesh
          key={`${x}:${z}`}
          position={[x, hoodSurfaceY(z) + 0.055, z]}
          scale={[size, 0.018, size * 0.65]}
          visible={damage > 0.01}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color="#100c08"
            roughness={1}
            transparent
            opacity={scorchOpacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
