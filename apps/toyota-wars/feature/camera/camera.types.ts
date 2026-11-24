export type CameraMode = "chase" | "drone" | "drone-roam";

export type DroneRoamState = {
  x: number;
  z: number;
  altitude: number;
  heading: number;
};

const CAMERA_MODE_ORDER: readonly CameraMode[] = [
  "chase",
  "drone",
  "drone-roam",
];

export function nextCameraMode(mode: CameraMode): CameraMode {
  const index = CAMERA_MODE_ORDER.indexOf(mode);
  return CAMERA_MODE_ORDER[(index + 1) % CAMERA_MODE_ORDER.length];
}

export function isDroneMode(mode: CameraMode): boolean {
  return mode === "drone" || mode === "drone-roam";
}

export function isRoamMode(mode: CameraMode): boolean {
  return mode === "drone-roam";
}

export type CameraPoseInput = {
  x: number;
  y: number;
  z: number;
  heading: number;
  visionPenalty: number;
  portrait?: boolean;
  yawOffset?: number;
  pitchOffset?: number;
};
