// camera/camera.types.ts
import type { FlowVec3 } from "../mission-flow.types";

export type CameraPoint =
  | { at: "player"; height?: number }
  | { at: "relative"; side: number; forward: number; height: number }
  | { at: "world"; position: FlowVec3 };

export interface CameraKeyframeSpec {
  position: CameraPoint;
  target: CameraPoint;
  fov: number;
}

export interface CameraShotSpec {
  from: CameraKeyframeSpec;
  to: CameraKeyframeSpec;
}

// authoring helpers
export const rel = (side: number, forward: number, height: number): CameraPoint =>
  ({ at: "relative", side, forward, height });
export const onPlayer = (height?: number): CameraPoint => ({ at: "player", height });
export const atWorld = (position: FlowVec3): CameraPoint => ({ at: "world", position });