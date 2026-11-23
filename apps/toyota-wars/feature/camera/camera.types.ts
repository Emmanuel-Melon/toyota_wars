export type CameraMode = "chase" | "drone";

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
