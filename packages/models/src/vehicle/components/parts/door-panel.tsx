// packages/models/src/vehicle/components/parts/door-panel.tsx
import type { DoorPanelVisualProps } from "../../types";

const doorY = 0.76;

export function DoorPanelVisual({
  side,
  paintMat,
  chromeMat,
  darkMat,
  showNumber = false,
  numberTexture,
  numberColor = "#20261d",
}: DoorPanelVisualProps) {
  const mirrorX = side * 0.15;

  return (
    <>
      <mesh material={paintMat} castShadow>
        <boxGeometry args={[0.045, 0.48, 0.86]} />
      </mesh>

      {/* Panel gaps: front, rear, bottom */}
      {[-0.425, 0.425].map((z) => (
        <mesh key={z} position={[side * 0.0235, 0, z]} material={darkMat}>
          <boxGeometry args={[0.008, 0.47, 0.01]} />
        </mesh>
      ))}
      <mesh position={[side * 0.0235, -0.235, 0]} material={darkMat}>
        <boxGeometry args={[0.008, 0.01, 0.86]} />
      </mesh>

      {/* Body crease */}
      <mesh position={[side * 0.025, 0.02, 0]} material={paintMat}>
        <boxGeometry args={[0.006, 0.012, 0.82]} />
      </mesh>

      {showNumber && numberTexture && (
        <mesh
          position={[side * 0.03, -0.06, -0.2]}
          rotation={[0, (side * Math.PI) / 2, 0]}
        >
          <planeGeometry args={[0.3, 0.16]} />
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
      )}

      {/* Handle: recessed plate, then the chrome grip */}
      <mesh position={[side * 0.026, 0.17, -0.25]} material={darkMat}>
        <boxGeometry args={[0.012, 0.045, 0.2]} />
      </mesh>
      <mesh position={[side * 0.036, 0.17, -0.25]} material={chromeMat}>
        <boxGeometry args={[0.02, 0.022, 0.14]} />
      </mesh>

      {/* Side mirror at the front-top corner */}
      <mesh position={[side * 0.075, 0.2, 0.34]} material={darkMat} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.03]} />
      </mesh>
      <mesh position={[mirrorX, 0.25, 0.33]} material={darkMat} castShadow>
        <boxGeometry args={[0.06, 0.11, 0.15]} />
      </mesh>
      <mesh position={[mirrorX, 0.25, 0.33 - 0.078]} material={chromeMat}>
        <boxGeometry args={[0.045, 0.09, 0.008]} />
      </mesh>
    </>
  );
}

export const PICKUP_DOOR_Y = doorY;