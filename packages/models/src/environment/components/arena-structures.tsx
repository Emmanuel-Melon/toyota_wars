// packages/models/src/environment/components/arena-structures.tsx
import { useMemo, type ComponentType } from "react";
import type { StructureVisual } from "../types";
import { Building } from "./structures/building";
import { Checkpoint } from "./structures/checkpoint";
import type { StructurePartProps } from "./structures/structure.types";
import { Watchtower } from "./structures/watchtower";
import { colorFor, useStructureAssets } from "./structures/structure-assets";
import { BASE_PART_COMPONENTS } from "./structures/structure-parts";
import { Base } from "./structures/base";

const STRUCTURE_PARTS: Record<
  StructureVisual["structure"],
  ComponentType<StructurePartProps>
> = {
  ...BASE_PART_COMPONENTS,
  base: Base,
};

type ArenaStructuresProps = {
  structures: readonly StructureVisual[];
  focus?: { readonly x: number; readonly z: number };
  visibleRadius?: number;
};

export function ArenaStructures({
  structures,
  focus,
  visibleRadius,
}: ArenaStructuresProps) {
  const { unitBox, sharedAssets } = useStructureAssets();

  const visibleStructures = useMemo(() => {
    if (!focus || visibleRadius === undefined) return structures;
    const radiusSq = (visibleRadius + 64) ** 2;
    return structures.filter((structure) => {
      const dx = structure.position.x - focus.x;
      const dz = structure.position.z - focus.z;
      return dx * dx + dz * dz <= radiusSq;
    });
  }, [structures, focus?.x, focus?.z, visibleRadius]);

  return (
    <group name="arena-structures">
      {visibleStructures.map((structure) => {
        const wallHex = colorFor(structure.id);
        const Part = STRUCTURE_PARTS[structure.structure];
        const materials = {
          wall: sharedAssets.wallMats.get(wallHex) ?? sharedAssets.woodMat,
          trim: sharedAssets.trimMat,
          roof: sharedAssets.roofMat,
          wood: sharedAssets.woodMat,
          sandbag: sharedAssets.sandbag,
          stripeRed: sharedAssets.stripeRed,
          stripeWhite: sharedAssets.stripeWhite,
        };

        return (
          <group
            key={structure.id}
            position={[
              structure.position.x,
              structure.position.y,
              structure.position.z,
            ]}
            rotation={[0, structure.yaw, 0]}
          >
            <Part
              structure={structure}
              materials={materials}
              unitBox={unitBox}
            />
          </group>
        );
      })}
    </group>
  );
}
