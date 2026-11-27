// structures/checkpoint.tsx
import { useMemo } from "react";
import { Box } from "./structure-box";
import { Watchtower } from "./watchtower";
import { CHECKPOINT, getCheckpointSlots } from "./structure-slots";
import type { StructurePartProps } from "./structure.types";

function Booth({ x, z, materials, unitBox }: { x: number; z: number } & Omit<StructurePartProps, "structure">) {
  return (
    <group position={[x, 0, z]}>
      <Box unitBox={unitBox} material={materials.wall} position={[0, 1.2, 0]} size={[2.2, 2.4, 2.2]} />
      <Box unitBox={unitBox} material={materials.wood} position={[0, 1.4, 1.11]} size={[1.2, 0.7, 0.06]} />
      <Box unitBox={unitBox} material={materials.roof} position={[0, 2.55, 0]} size={[2.7, 0.2, 2.7]} />
    </group>
  );
}

function SandbagWall({ x, z, length, rotationY = 0, materials, unitBox }: {
  x: number; z: number; length: number; rotationY?: number;
} & Omit<StructurePartProps, "structure">) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <Box unitBox={unitBox} material={materials.sandbag} position={[0, 0.3, 0]} size={[length, 0.6, 0.7]} />
      <Box unitBox={unitBox} material={materials.sandbag} position={[0, 0.8, 0]} size={[length * 0.9, 0.4, 0.55]} />
    </group>
  );
}

export function Checkpoint({ structure, materials, unitBox }: StructurePartProps) {
  const { width, depth } = structure;
  const lane = CHECKPOINT.laneWidth;
  const gateZ = depth / 2 - 1.5;
  const boothX = lane / 2 + 1.5;
  const shared = { materials, unitBox };

  const bays = useMemo(
    () => getCheckpointSlots(structure).filter((s) => s.role === "vehicle"),
    [structure],
  );

  // Boom arm: alternating red/white segments
  const segments = 6;
  const segLength = lane / segments;

  return (
    <group>
      {/* Boom gate */}
      <Box unitBox={unitBox} material={materials.trim} position={[-lane / 2 - 0.3, 0.6, gateZ]} size={[0.3, 1.2, 0.3]} />
      {Array.from({ length: segments }, (_, i) => (
        <Box
          key={i}
          unitBox={unitBox}
          material={i % 2 === 0 ? materials.stripeRed : materials.stripeWhite}
          position={[-lane / 2 + segLength * (i + 0.5), 1.1, gateZ]}
          size={[segLength, 0.14, 0.14]}
        />
      ))}

      {/* Guard booths flanking the lane + sandbag walls */}
      <Booth x={-boothX} z={gateZ + 1.6} {...shared} />
      <Booth x={boothX} z={gateZ + 1.6} {...shared} />
      <SandbagWall x={-boothX - 2.5} z={gateZ + 3} length={4} {...shared} />
      <SandbagWall x={boothX + 2.5} z={gateZ + 3} length={4} {...shared} />

      {/* Chicane: staggered barriers force vehicles to slow down */}
      <Box unitBox={unitBox} material={materials.stripeWhite} position={[-1.2, 0.45, gateZ - 4]} size={[2.2, 0.9, 0.6]} />
      <Box unitBox={unitBox} material={materials.stripeWhite} position={[1.2, 0.45, gateZ - 7]} size={[2.2, 0.9, 0.6]} />

      {/* Sandbag revetment behind each vehicle bay */}
      {bays.map((bay) => (
        <SandbagWall
          key={bay.id}
          x={bay.position.x}
          z={bay.position.z - 3.4}
          length={5.5}
          {...shared}
        />
      ))}

      {/* Corner watchtower (reuses the existing model) */}
      <group position={[width / 2 - 2.5, 0, -depth / 2 + 2.5]}>
        <Watchtower structure={{ ...structure, width: 4, depth: 4, height: 8 }} {...shared} />
      </group>

      {/* Flag pole */}
      <Box unitBox={unitBox} material={materials.trim} position={[-boothX - 1.5, 3, gateZ + 1.6]} size={[0.12, 6, 0.12]} />
      <Box unitBox={unitBox} material={materials.stripeRed} position={[-boothX - 0.9, 5.4, gateZ + 1.6]} size={[1.2, 0.7, 0.04]} />
    </group>
  );
}