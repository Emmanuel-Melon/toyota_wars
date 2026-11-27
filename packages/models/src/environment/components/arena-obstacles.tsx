// packages/models/src/environment/components/arena-obstacles.tsx
import { useEffect, useMemo } from "react";
import { DodecahedronGeometry, MeshStandardMaterial } from "three";
import type { RockObstacleVisual, TerrainSampler } from "../types";

const ROCK_PALETTE = ["#77694e", "#6d624c", "#7f7258", "#655c4a"] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function createDeformedRockGeometry(seed: number): DodecahedronGeometry {
  const geo = new DodecahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const n = Math.sin(x * 4.7 + seed * 1.3) * Math.cos(z * 5.1 - seed * 0.9);
    const factor = 1 + n * 0.14;
    pos.setXYZ(i, x * factor, y * (0.78 + n * 0.1), z * factor);
  }
  geo.computeVertexNormals();
  return geo;
}

type ArenaObstaclesProps = {
  obstacles: readonly RockObstacleVisual[];
  terrain: TerrainSampler;
  focus?: { readonly x: number; readonly z: number };
  visibleRadius?: number;
};

export function ArenaObstacles({
  obstacles,
  terrain,
  focus,
  visibleRadius,
}: ArenaObstaclesProps) {
  const rockEntries = useMemo(
    () =>
      obstacles
        .filter((obstacle) => obstacle.shape !== "box")
        .map((obstacle) => {
          const seed = hashString(obstacle.id);
          const baseRadius = Math.max(0.2, obstacle.radius);
          const scaleX = baseRadius * (0.9 + ((seed % 17) / 17) * 0.35);
          const scaleY = baseRadius * (0.65 + (((seed >> 4) % 13) / 13) * 0.35);
          const scaleZ = baseRadius * (0.85 + (((seed >> 8) % 19) / 19) * 0.35);
          const groundY = terrain.getHeight(
            obstacle.position.x,
            obstacle.position.z,
          );

          return {
            id: obstacle.id,
            seed,
            x: obstacle.position.x,
            y: groundY + scaleY * 0.32,
            z: obstacle.position.z,
            scale: [scaleX, scaleY, scaleZ] as const,
            rotationY: obstacle.rotation ?? ((seed % 360) * Math.PI) / 180,
            color: ROCK_PALETTE[seed % ROCK_PALETTE.length],
          };
        }),
    [obstacles, terrain],
  );

  const visibleRocks = useMemo(() => {
    if (!focus || visibleRadius === undefined) return rockEntries;
    const radiusSq = (visibleRadius + 8) ** 2;
    return rockEntries.filter((rock) => {
      const dx = rock.x - focus.x;
      const dz = rock.z - focus.z;
      return dx * dx + dz * dz <= radiusSq;
    });
  }, [rockEntries, focus?.x, focus?.z, visibleRadius]);

  const materials = useMemo(
    () =>
      ROCK_PALETTE.map(
        (color, idx) =>
          new MeshStandardMaterial({
            color,
            roughness: 0.88 + (idx % 3) * 0.04,
            metalness: 0.04,
          }),
      ),
    [],
  );

  useEffect(() => {
    return () => {
      materials.forEach((m) => m.dispose());
    };
  }, [materials]);

  return (
    <group name="arena-obstacles">
      {visibleRocks.map((rock) => (
        <RockMesh
          key={rock.id}
          rock={rock}
          material={materials[rock.seed % materials.length]}
        />
      ))}
    </group>
  );
}

function RockMesh({
  rock,
  material,
}: {
  rock: {
    seed: number;
    x: number;
    y: number;
    z: number;
    scale: readonly [number, number, number];
    rotationY: number;
  };
  material: MeshStandardMaterial;
}) {
  const geometry = useMemo(
    () => createDeformedRockGeometry(rock.seed),
    [rock.seed],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      position={[rock.x, rock.y, rock.z]}
      rotation={[0.06, rock.rotationY, -0.05]}
      scale={[rock.scale[0], rock.scale[1], rock.scale[2]]}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}
