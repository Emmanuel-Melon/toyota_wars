import type { GlassPanelVisualProps } from "../../types";

const zeroRotation: [number, number, number] = [0, 0, 0];

export function GlassPanelVisual({
  position,
  rotation = zeroRotation,
  size,
  glassMat,
  crackMat,
  cracked = false,
}: GlassPanelVisualProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={glassMat} castShadow={false}>
        <boxGeometry args={size} />
      </mesh>
      {cracked && (
        <group>
          <mesh material={crackMat}>
            <boxGeometry args={[0.012, size[1] * 0.9, size[2] + 0.008]} />
          </mesh>
          <mesh
            position={[size[0] * 0.12, 0, 0]}
            rotation={[0, 0, -0.65]}
            material={crackMat}
          >
            <boxGeometry args={[0.01, size[1] * 0.75, size[2] + 0.008]} />
          </mesh>
          <mesh
            position={[-size[0] * 0.18, size[1] * 0.12, 0]}
            rotation={[0, 0, 0.5]}
            material={crackMat}
          >
            <boxGeometry args={[0.01, size[1] * 0.6, size[2] + 0.008]} />
          </mesh>
        </group>
      )}
    </group>
  );
}
