// trenches/trenches.tsx
import { useMemo } from "react";
import type { TerrainSampler, TrenchVisual } from "../../types";
import { Box } from "../structures/structure-box";
import { useStructureAssets } from "../structures/structure-assets";
import { TRENCH } from "../../geometry/trench-geometry";
import { getTrenchPieces } from "./trench-layout";
import type { TrenchPiece } from "./trench-layout";

type SegmentProps = {
  piece: TrenchPiece;
  unitBox: ReturnType<typeof useStructureAssets>["unitBox"];
  materials: ReturnType<typeof useStructureAssets>["sharedAssets"];
};

function TrenchSegment({ piece, unitBox, materials }: SegmentProps) {
  const { length, width, depth, front } = piece;
  const half = width / 2;
  const t = TRENCH.liningThickness;
  const L = length + t * 2; // overlap at joints hides gaps on bends
  const wallHeight = depth + TRENCH.lip;

  return (
    <group position={[piece.x, piece.y, piece.z]} rotation={[0, piece.yaw, piece.pitch]}>
      {/* Revetment walls (floor level is local y = 0) */}
      {([-1, 1] as const).map((side) => (
        <Box
          key={side}
          unitBox={unitBox}
          material={materials.woodMat}
          position={[0, wallHeight / 2, side * (half + t / 2)]}
          size={[L, wallHeight, t]}
        />
      ))}

      {/* Duckboards */}
      <Box unitBox={unitBox} material={materials.trimMat} position={[0, 0.03, 0]} size={[L, 0.06, width * 0.85]} />

      {/* Firing step against the front wall */}
      <Box
        unitBox={unitBox}
        material={materials.sandbag}
        position={[0, TRENCH.stepHeight / 2, front * (half - TRENCH.stepWidth / 2)]}
        size={[length * 0.92, TRENCH.stepHeight, TRENCH.stepWidth]}
      />

      {/* Sandbag parapet on the front lip, sitting on ground level (y = depth) */}
      <Box
        unitBox={unitBox}
        material={materials.sandbag}
        position={[0, depth + 0.28, front * (half + t + 0.45)]}
        size={[L, 0.56, 0.9]}
      />
    </group>
  );
}

type TrenchesProps = {
  trenches: readonly TrenchVisual[];
  /** The carved sampler from withTrenches(). */
  terrain: TerrainSampler;
};

export function Trenches({ trenches, terrain }: TrenchesProps) {
  const { unitBox, sharedAssets } = useStructureAssets();
  const pieces = useMemo(
    () => trenches.flatMap((t) => getTrenchPieces(t, terrain)),
    [trenches, terrain],
  );

  return (
    <group name="trenches">
      {pieces.map((piece) => (
        <TrenchSegment key={piece.id} piece={piece} unitBox={unitBox} materials={sharedAssets} />
      ))}
    </group>
  );
}