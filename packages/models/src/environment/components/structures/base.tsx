// structures/base.tsx
import { useMemo } from "react";
import { Box } from "./structure-box";
import { getBaseLayout } from "./base-layout";
import { BASE_PART_COMPONENTS } from "./structure-parts";
import type { StructurePartProps } from "./structure.types";

export function Base({ structure, materials, unitBox }: StructurePartProps) {
  const layout = useMemo(() => getBaseLayout(structure), [structure]);

  return (
    <group name={`base-${structure.id}`}>
      {layout.walls.map((wall) => (
        <Box key={wall.id} unitBox={unitBox} material={materials.wall} position={wall.position} size={wall.size} />
      ))}

      <Box
        unitBox={unitBox}
        material={materials.trim}
        position={layout.motorPoolPad.position}
        size={layout.motorPoolPad.size}
      />

      {layout.parts.map((part) => {
        const Part = BASE_PART_COMPONENTS[part.structure];
        return (
          <group
            key={part.id}
            position={[part.position.x, part.position.y, part.position.z]}
            rotation={[0, part.yaw, 0]}
          >
            <Part structure={part} materials={materials} unitBox={unitBox} />
          </group>
        );
      })}
    </group>
  );
}