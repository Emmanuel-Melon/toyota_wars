// structures/structure-parts.tsx: everything a base can contain (no "base" here)
import type { ComponentType } from "react";
import { Building } from "./building";
import { Checkpoint } from "./checkpoint";
import { Watchtower } from "./watchtower";
import type { BasePartKind, StructurePartProps } from "./structure.types";

export const BASE_PART_COMPONENTS: Record<BasePartKind, ComponentType<StructurePartProps>> = {
  building: Building,
  watchtower: Watchtower,
  checkpoint: Checkpoint,
};