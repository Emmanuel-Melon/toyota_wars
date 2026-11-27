// apps/toyota-wars/feature/terrain/components/tree-patches.tsx
"use client";

import { useRef } from "react";
import { Environment } from "@toyota/models";
import type { ArenaObstacle } from "@/lib/map/arena";
import type { RoadNetwork } from "@/lib/map/map.network";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import { useSnappedScatter } from "../hooks/use-snapped-scatter";

type WorldPosition = { readonly x: number; readonly z: number };
type Clearing = { x: number; z: number; radius: number };

interface TreePatchesProps {
  playerBody: { readonly position: WorldPosition };
  terrain: TerrainSampler;
  obstacles?: readonly ArenaObstacle[];
  clearings?: readonly Clearing[];
  roads?: Pick<RoadNetwork, "distanceToRoad">;
  roadWidth?: number;
  bound?: number;
  cellSize?: number;
  cellRadius?: number;
  density?: number;
  seed?: number;
}

export function TreePatches({
  playerBody,
  cellSize = Environment.TREE_DEFAULTS.cellSize,
  ...fieldProps
}: TreePatchesProps) {
  const fieldRef = useRef<Environment.TreeFieldHandle>(null);
  const initialCenter = useSnappedScatter(
    playerBody,
    Environment.getTreeSnapStep(cellSize),
    (x, z) => fieldRef.current?.scatter(x, z),
  );

  return (
    <Environment.TreeField
      ref={fieldRef}
      initialCenterX={initialCenter.x}
      initialCenterZ={initialCenter.z}
      cellSize={cellSize}
      {...fieldProps}
    />
  );
}