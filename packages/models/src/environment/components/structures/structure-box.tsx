// structures/structure-box.tsx
import type { BoxGeometry, MeshStandardMaterial } from "three";

type BoxProps = {
  unitBox: BoxGeometry;
  material: MeshStandardMaterial;
  position: [number, number, number];
  size: [number, number, number];
  rotationY?: number;
};

export function Box({
  unitBox,
  material,
  position,
  size,
  rotationY = 0,
}: BoxProps) {
  return (
    <mesh
      position={position}
      rotation={[0, rotationY, 0]}
      scale={size}
      geometry={unitBox}
      material={material}
      castShadow
      receiveShadow
    />
  );
}