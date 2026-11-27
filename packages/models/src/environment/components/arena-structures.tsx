// packages/models/src/environment/components/arena-structures.tsx
import type { ComponentType } from "react";
import type { StructureVisual } from "../types";
import { Building } from "./structures/building";
import { Checkpoint } from "./structures/checkpoint";
import type { StructurePartProps } from "./structures/structure.types";
import { Watchtower } from "./structures/watchtower";
import {
  colorFor,
  useStructureAssets,
} from "./structures/structure-assets";
import { BASE_PART_COMPONENTS } from "./structures/structure-parts";
import { Base } from "./structures/base";

const STRUCTURE_PARTS: Record<
  StructureVisual["structure"],
  ComponentType<StructurePartProps>
> = {
  ...BASE_PART_COMPONENTS,
  base: Base,
};

export function ArenaStructures({
  structures,
}: {
  structures: readonly StructureVisual[];
}) {
  const { unitBox, sharedAssets } = useStructureAssets();

  return (
    <group name="arena-structures">
      {structures.map((structure) => {
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
