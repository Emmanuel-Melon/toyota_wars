// packages/models/src/environment/components/structures/watchtower.tsx
import type { StructurePartProps } from "./structure.types";

export function Watchtower({
  structure,
  materials,
  unitBox,
}: StructurePartProps) {
  const { width, depth, height } = structure;
  const legHeight = height * 0.58;
  const deckThickness = 0.22;
  const railingHeight = 0.55;
  const cabinHeight = Math.max(1.3, height - legHeight - deckThickness - 0.35);
  const legOffsetX = width * 0.36;
  const legOffsetZ = depth * 0.36;
  const legSize = Math.max(0.18, Math.min(width, depth) * 0.08);

  const legs: readonly (readonly [number, number])[] = [
    [-legOffsetX, -legOffsetZ],
    [legOffsetX, -legOffsetZ],
    [-legOffsetX, legOffsetZ],
    [legOffsetX, legOffsetZ],
  ];

  const deckY = legHeight + deckThickness / 2;
  const cabinY = legHeight + deckThickness + cabinHeight / 2;
  const roofY = legHeight + deckThickness + cabinHeight + 0.15;

  return (
    <group>
      {/* Support legs */}
      {legs.map(([x, z], index) => (
        <mesh
          key={index}
          position={[x, legHeight / 2, z]}
          scale={[legSize, legHeight, legSize]}
          geometry={unitBox}
          material={materials.wood}
          castShadow
          receiveShadow
        />
      ))}

      {/* Horizontal tie-beams mid-leg for structural realism */}
      <mesh
        position={[0, legHeight * 0.52, legOffsetZ]}
        scale={[legOffsetX * 2, legSize * 0.65, legSize * 0.65]}
        geometry={unitBox}
        material={materials.wood}
        castShadow
      />
      <mesh
        position={[0, legHeight * 0.52, -legOffsetZ]}
        scale={[legOffsetX * 2, legSize * 0.65, legSize * 0.65]}
        geometry={unitBox}
        material={materials.wood}
        castShadow
      />

      {/* Platform deck */}
      <mesh
        position={[0, deckY, 0]}
        scale={[width, deckThickness, depth]}
        geometry={unitBox}
        material={materials.wood}
        castShadow
        receiveShadow
      />

      {/* Deck edge trim / low guardrail */}
      <mesh
        position={[0, legHeight + deckThickness + railingHeight / 2, depth / 2 - 0.05]}
        scale={[width, railingHeight, 0.08]}
        geometry={unitBox}
        material={materials.trim}
        castShadow
      />

      {/* Cabin */}
      <mesh
        position={[0, cabinY, 0]}
        scale={[width * 0.72, cabinHeight, depth * 0.72]}
        geometry={unitBox}
        material={materials.wall}
        castShadow
        receiveShadow
      />

      {/* Roof cap */}
      <mesh
        position={[0, roofY, 0]}
        scale={[width + 0.44, 0.28, depth + 0.44]}
        geometry={unitBox}
        material={materials.roof}
        castShadow
        receiveShadow
      />
    </group>
  );
}
