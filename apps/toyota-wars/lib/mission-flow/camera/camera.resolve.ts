// camera/camera.resolve.ts
import type {
  FlowCameraContext, FlowCameraResolver, FlowVec3,
} from "../mission-flow.types";
import type { CameraKeyframeSpec, CameraPoint, CameraShotSpec } from "./camera.types";

function anchoredPoint(ctx: FlowCameraContext, side: number, forward: number, height: number): FlowVec3 {
  const rightX = Math.cos(ctx.playerHeading);
  const rightZ = -Math.sin(ctx.playerHeading);
  const forwardX = Math.sin(ctx.playerHeading);
  const forwardZ = Math.cos(ctx.playerHeading);
  const x = ctx.playerPosition.x + rightX * side + forwardX * forward;
  const z = ctx.playerPosition.z + rightZ * side + forwardZ * forward;
  return [x, Math.max(ctx.terrainHeight(x, z) + height, height), z];
}

function playerPoint(ctx: FlowCameraContext, height: number): FlowVec3 {
  const { x, y, z } = ctx.playerPosition;
  return [x, Math.max(ctx.terrainHeight(x, z), y) + height, z];
}

export function resolvePoint(ctx: FlowCameraContext, p: CameraPoint): FlowVec3 {
  switch (p.at) {
    case "player":   return playerPoint(ctx, p.height ?? 2.4);
    case "relative": return anchoredPoint(ctx, p.side, p.forward, p.height);
    case "world":    return p.position;
  }
}

const resolveKeyframe = (ctx: FlowCameraContext, k: CameraKeyframeSpec) => ({
  position: resolvePoint(ctx, k.position),
  target: resolvePoint(ctx, k.target),
  fov: k.fov,
});

export function createCameraResolver(shot: CameraShotSpec): FlowCameraResolver {
  return (ctx) => ({ from: resolveKeyframe(ctx, shot.from), to: resolveKeyframe(ctx, shot.to) });
}