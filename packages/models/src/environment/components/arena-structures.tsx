// packages/models/src/environment/components/arena-structures.tsx
import { useEffect, useMemo } from "react";
import { BoxGeometry, MeshStandardMaterial } from "three";
import type { StructureVisual } from "../types";

const WALL_COLORS = ["#a78f6a", "#9d8464", "#b09a76", "#8f7a5e"] as const;
const ROOF_COLOR = "#5d4634";
const TRIM_COLOR = "#4a3b2c";
const WOOD = "#5a4632";

function colorFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return WALL_COLORS[hash % WALL_COLORS.length];
}

function Building({
  structure,
  materials,
  unitBox,
}: {
  structure: StructureVisual;
  materials: {
    wall: MeshStandardMaterial;
    trim: MeshStandardMaterial;
    roof: MeshStandardMaterial;
    wood: MeshStandardMaterial;
  };
  unitBox: BoxGeometry;
}) {
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

function Watchtower({
  structure,
  materials,
  unitBox,
}: {
  structure: StructureVisual;
  materials: {
    wall: MeshStandardMaterial;
    trim: MeshStandardMaterial;
    roof: MeshStandardMaterial;
    wood: MeshStandardMaterial;
  };
  unitBox: BoxGeometry;
}) {
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

export function ArenaStructures({
  structures,
}: {
  structures: readonly StructureVisual[];
}) {
  const unitBox = useMemo(() => new BoxGeometry(1, 1, 1), []);

  const sharedAssets = useMemo(() => {
    const trimMat = new MeshStandardMaterial({
      color: TRIM_COLOR,
      roughness: 0.9,
      metalness: 0.05,
    });
    const roofMat = new MeshStandardMaterial({
      color: ROOF_COLOR,
      roughness: 0.92,
      metalness: 0.08,
    });
    const woodMat = new MeshStandardMaterial({
      color: WOOD,
      roughness: 0.9,
      metalness: 0.02,
    });
    const wallMats = new Map<string, MeshStandardMaterial>();
    for (const hex of WALL_COLORS) {
      wallMats.set(
        hex,
        new MeshStandardMaterial({
          color: hex,
          roughness: 0.88,
          metalness: 0.04,
        }),
      );
    }
    return { trimMat, roofMat, woodMat, wallMats };
  }, []);

  useEffect(() => {
    return () => {
      unitBox.dispose();
      sharedAssets.trimMat.dispose();
      sharedAssets.roofMat.dispose();
      sharedAssets.woodMat.dispose();
      sharedAssets.wallMats.forEach((m) => m.dispose());
    };
  }, [unitBox, sharedAssets]);

  return (
    <group name="arena-structures">
      {structures.map((structure) => {
        const wallHex = colorFor(structure.id);
        const materials = {
          wall: sharedAssets.wallMats.get(wallHex) ?? sharedAssets.woodMat,
          trim: sharedAssets.trimMat,
          roof: sharedAssets.roofMat,
          wood: sharedAssets.woodMat,
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
            {structure.structure === "watchtower" ? (
              <Watchtower
                structure={structure}
                materials={materials}
                unitBox={unitBox}
              />
            ) : (
              <Building
                structure={structure}
                materials={materials}
                unitBox={unitBox}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}