// packages/models/src/environment/components/structures/building.tsx
import type { StructurePartProps } from "./structure.types";

export function Building({ structure, materials, unitBox }: StructurePartProps) {
  const { width, depth, height } = structure;
  const plinthHeight = Math.min(0.25, height * 0.08);
  const wallHeight = Math.max(0.5, height - plinthHeight);
  const corniceHeight = Math.max(0.1, height * 0.04);
  const roofHeight = Math.max(0.24, height * 0.12);
  const postThickness = Math.max(0.08, Math.min(width, depth) * 0.06);

  const cornerOffsets: readonly (readonly [number, number])[] = [
    [-width / 2 + postThickness / 2, -depth / 2 + postThickness / 2],
    [width / 2 - postThickness / 2, -depth / 2 + postThickness / 2],
    [-width / 2 + postThickness / 2, depth / 2 - postThickness / 2],
    [width / 2 - postThickness / 2, depth / 2 - postThickness / 2],
  ];

  return (
    <group>
      {/* Grounded base plinth */}
      <mesh
        position={[0, plinthHeight / 2, 0]}
        scale={[width + 0.24, plinthHeight, depth + 0.24]}
        geometry={unitBox}
        material={materials.trim}
        castShadow
        receiveShadow
      />

      {/* Main wall body */}
      <mesh
        position={[0, plinthHeight + wallHeight / 2, 0]}
        scale={[width, wallHeight, depth]}
        geometry={unitBox}
        material={materials.wall}
        castShadow
        receiveShadow
      />

      {/* Corner pilasters for shadow & edge definition */}
      {cornerOffsets.map(([cx, cz], idx) => (
        <mesh
          key={idx}
          position={[cx, plinthHeight + wallHeight / 2, cz]}
          scale={[postThickness * 1.15, wallHeight, postThickness * 1.15]}
          geometry={unitBox}
          material={materials.trim}
          castShadow
          receiveShadow
        />
      ))}

      {/* Front & back recessed/framed opening accents */}
      <mesh
        position={[0, plinthHeight + wallHeight * 0.42, depth / 2 + 0.02]}
        scale={[Math.min(0.9, width * 0.24), Math.min(1.8, wallHeight * 0.55), 0.05]}
        geometry={unitBox}
        material={materials.wood}
        castShadow
        receiveShadow
      />

      {/* Cornice band */}
      <mesh
        position={[0, plinthHeight + wallHeight + corniceHeight / 2, 0]}
        scale={[width + 0.36, corniceHeight, depth + 0.36]}
        geometry={unitBox}
        material={materials.trim}
        castShadow
        receiveShadow
      />

      {/* Overhanging roof */}
      <mesh
        position={[0, plinthHeight + wallHeight + corniceHeight + roofHeight / 2, 0]}
        scale={[width + 0.56, roofHeight, depth + 0.56]}
        geometry={unitBox}
        material={materials.roof}
        castShadow
        receiveShadow
      />
    </group>
  );
}
