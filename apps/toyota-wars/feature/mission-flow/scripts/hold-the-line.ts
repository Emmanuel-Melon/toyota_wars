// apps/toyota-wars/feature/mission-flow/scripts/hold-the-line.ts
import type {
  FlowCameraResolver,
  FlowCameraShot,
  FlowCameraContext,
  FlowScript,
  FlowVec3,
} from "../mission-flow.types";

function anchoredPoint(
  context: FlowCameraContext,
  side: number,
  forward: number,
  height: number,
): FlowVec3 {
  const rightX = Math.cos(context.playerHeading);
  const rightZ = -Math.sin(context.playerHeading);
  const forwardX = Math.sin(context.playerHeading);
  const forwardZ = Math.cos(context.playerHeading);
  const x = context.playerPosition.x + rightX * side + forwardX * forward;
  const z = context.playerPosition.z + rightZ * side + forwardZ * forward;
  return [x, Math.max(context.terrainHeight(x, z) + height, height), z];
}

function playerPoint(context: FlowCameraContext, height: number): FlowVec3 {
  const { x, y } = context.playerPosition;
  const z = context.playerPosition.z;
  return [x, Math.max(context.terrainHeight(x, z), y) + height, z];
}

function wideShot(context: FlowCameraContext): FlowCameraShot {
  return {
    from: {
      position: anchoredPoint(context, -52, -48, 28),
      target: anchoredPoint(context, -72, -112, 2),
      fov: 58,
    },
    to: {
      position: anchoredPoint(context, -24, -26, 12),
      target: playerPoint(context, 2.4),
      fov: 52,
    },
  };
}

function evadeShot(context: FlowCameraContext): FlowCameraShot {
  return {
    from: {
      position: anchoredPoint(context, 14, -10, 5.5),
      target: anchoredPoint(context, -8, 14, 2),
      fov: 54,
    },
    to: {
      position: anchoredPoint(context, -12, -8, 5),
      target: playerPoint(context, 2.2),
      fov: 48,
    },
  };
}

const wide: FlowCameraResolver = wideShot;
const evade: FlowCameraResolver = evadeShot;

export const holdTheLineOpening: FlowScript = {
  id: "hold-the-line-opening",
  steps: [
    {
      type: "cutscene",
      id: "hold-the-line-flank",
      durationMs: 3600,
      title: "FLANKING FIRE",
      caption: "Type 63 support is opening fire from the left flank.",
      camera: wide,
    },
    {
      type: "qte",
      id: "hold-the-line-evade",
      durationMs: 2200,
      title: "EVASIVE ACTION",
      caption: "The first salvo is inbound.",
      camera: evade,
      qte: {
        prompt: "DODGE THE SALVO",
        detail: "Tap A or D before impact.",
        keys: ["a", "d"],
        labels: ["A", "D"],
        durationMs: 2200,
      },
    },
  ],
};
