import { PICKUP } from "../../config/vehicle-visual.config";
import type { DoorPanelVisualProps } from "../../types";

const doorY = 0.76;

export function DoorPanelVisual({
  side,
  z,
  paintMat,
  chromeMat,
  darkMat,
  showNumber = false,
  numberTexture,
  numberColor = "#20261d",
}: DoorPanelVisualProps) {
  const x = side * (PICKUP.width / 2 + 0.025);

  return (
    <>
      <mesh material={paintMat} castShadow>
        <boxGeometry args={[0.045, 0.48, 0.86]} />
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
      <mesh position={[side * 0.03, 0.17, 0]} material={chromeMat}>
        <boxGeometry args={[0.02, 0.03, 0.16]} />
      </mesh>
      <mesh position={[side * 0.025, 0, 0]} material={darkMat}>
        <boxGeometry args={[0.012, 0.44, 0.012]} />
      </mesh>
    </>
  );
}

export const PICKUP_DOOR_Y = doorY;
