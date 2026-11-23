"use client";

import type { ArenaStructure } from "@/lib/map/structures";

const WALL_COLORS = ["#a78f6a", "#9d8464", "#b09a76", "#8f7a5e"];
const ROOF_COLOR = "#5d4634";
const WOOD = "#5a4632";

function colorFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return WALL_COLORS[hash % WALL_COLORS.length];
}

function Building({ structure }: { structure: ArenaStructure }) {
  const { width, depth, height } = structure;
  const roofHeight = Math.max(0.25, height * 0.12);
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={colorFor(structure.id)} roughness={0.95} />
      </mesh>
      <mesh position={[0, height + roofHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.6, roofHeight, depth + 0.6]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={1} />
      </mesh>
    </group>
  );
}

function Watchtower({ structure }: { structure: ArenaStructure }) {
  const { width, depth, height } = structure;
  const legHeight = height * 0.62;
  const cabinHeight = Math.max(1.4, height - legHeight - 0.5);
  const legOffsetX = width * 0.34;
  const legOffsetZ = depth * 0.34;
  const legs: readonly (readonly [number, number])[] = [
    [-legOffsetX, -legOffsetZ],
    [legOffsetX, -legOffsetZ],
    [-legOffsetX, legOffsetZ],
    [legOffsetX, legOffsetZ],
  ];

  return (
    <group>
      {legs.map(([x, z], index) => (
        <mesh key={index} position={[x, legHeight / 2, z]} castShadow>
          <boxGeometry args={[0.25, legHeight, 0.25]} />
          <meshStandardMaterial color={WOOD} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0, legHeight + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.24, depth]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      <mesh
        position={[0, legHeight + 0.24 + cabinHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width * 0.75, cabinHeight, depth * 0.75]} />
        <meshStandardMaterial color="#a78f6a" roughness={0.95} />
      </mesh>
      <mesh position={[0, legHeight + 0.24 + cabinHeight + 0.15, 0]} castShadow>
        <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
        <meshStandardMaterial color={ROOF_COLOR} roughness={1} />
      </mesh>
    </group>
  );
}

export function ArenaStructures({
  structures,
}: {
  structures: readonly ArenaStructure[];
}) {
  return (
    <group name="arena-structures">
      {structures.map((structure) => (
        <group
          key={structure.id}
          position={[
            structure.position.x,
            structure.position.y,
            structure.position.z,
          ]}
          rotation={[0, structure.yaw, 0]}
        >
          {structure.structure === "watchtower" ? (
            <Watchtower structure={structure} />
          ) : (
            <Building structure={structure} />
          )}
        </group>
      ))}
    </group>
  );
}
