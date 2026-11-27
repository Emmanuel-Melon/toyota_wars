import * as THREE from "three";
import type { ArenaObstacle } from "./arena";
import type { TerrainSampler } from "./map.terrain";
import type { ArenaStructure } from "./structures";

type CheckpointPart = {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
};

const CHECKPOINT_LANE_WIDTH = 5;

function checkpointParts(structure: ArenaStructure): CheckpointPart[] {
  const gateZ = structure.depth / 2 - 1.5;
  const boothX = CHECKPOINT_LANE_WIDTH / 2 + 1.5;
  const bayX = Math.max(
    CHECKPOINT_LANE_WIDTH / 2 + 4,
    structure.width / 2 - 3.5,
  );
  const bays = [
    { x: -bayX, z: -structure.depth * 0.1 },
    { x: bayX, z: -structure.depth * 0.1 },
    { x: -bayX, z: -structure.depth * 0.1 - 6.5 },
  ];

  return [
    {
      id: "booth-left",
      x: -boothX,
      z: gateZ + 1.6,
      width: 2.7,
      depth: 2.7,
      height: 2.4,
    },
    {
      id: "booth-right",
      x: boothX,
      z: gateZ + 1.6,
      width: 2.7,
      depth: 2.7,
      height: 2.4,
    },
    {
      id: "sandbag-left",
      x: -boothX - 2.5,
      z: gateZ + 3,
      width: 4,
      depth: 0.7,
      height: 0.8,
    },
    {
      id: "sandbag-right",
      x: boothX + 2.5,
      z: gateZ + 3,
      width: 4,
      depth: 0.7,
      height: 0.8,
    },
    {
      id: "chicane-front",
      x: -1.2,
      z: gateZ - 4,
      width: 2.2,
      depth: 0.6,
      height: 0.9,
    },
    {
      id: "chicane-rear",
      x: 1.2,
      z: gateZ - 7,
      width: 2.2,
      depth: 0.6,
      height: 0.9,
    },
    ...bays.map((bay, index) => ({
      id: `revetment-${index}`,
      x: bay.x,
      z: bay.z - 3.4,
      width: 5.5,
      depth: 0.7,
      height: 0.8,
    })),
    {
      id: "watchtower",
      x: structure.width / 2 - 2.5,
      z: -structure.depth / 2 + 2.5,
      width: 4,
      depth: 4,
      height: 8,
    },
  ];
}

export function createCheckpointObstacles(
  structure: ArenaStructure,
  terrain: TerrainSampler,
): ArenaObstacle[] {
  const cos = Math.cos(structure.yaw);
  const sin = Math.sin(structure.yaw);

  return checkpointParts(structure).map((part) => {
    const x = structure.position.x + part.x * cos + part.z * sin;
    const z = structure.position.z - part.x * sin + part.z * cos;
    const halfWidth = part.width / 2;
    const halfDepth = part.depth / 2;

    return {
      id: `${structure.id}-${part.id}`,
      position: new THREE.Vector3(x, terrain.getHeight(x, z), z),
      radius: Math.hypot(halfWidth, halfDepth),
      shape: "box",
      halfWidth,
      halfDepth,
      yaw: structure.yaw,
      height: part.height,
      destructible: false,
    };
  });
}
