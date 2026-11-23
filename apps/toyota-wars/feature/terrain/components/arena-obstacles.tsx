// apps/toyota-wars/feature/terrain/components/arena-obstacles.tsx
"use client";

import { useMemo } from "react";
import type { ArenaObstacle } from "@/lib/map/arena";
import type { TerrainSampler } from "@/lib/map/map.terrain";

type ArenaObstaclesProps = {
  obstacles: readonly ArenaObstacle[];
  terrain: TerrainSampler;
};

export function ArenaObstacles({ obstacles, terrain }: ArenaObstaclesProps) {
  const rocks = useMemo(
    () =>
      obstacles
        .filter((obstacle) => obstacle.shape !== "box")
        .map((obstacle) => ({
          id: obstacle.id,
          x: obstacle.position.x,
          z: obstacle.position.z,
          y:
            terrain.getHeight(obstacle.position.x, obstacle.position.z) +
            (obstacle.scale ?? obstacle.radius) * 0.25,
          radius: obstacle.radius,
          rotation: obstacle.rotation ?? 0,
        })),
    [obstacles, terrain],
  );

  return (
    <group name="arena-obstacles">
      {rocks.map((rock) => (
        <mesh
          key={rock.id}
          position={[rock.x, rock.y, rock.z]}
          rotation={[0, rock.rotation, 0]}
          scale={rock.radius}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#77694e" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
