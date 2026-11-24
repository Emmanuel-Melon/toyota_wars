export type FlowPhase = "gameplay" | "cutscene" | "qte";

export type FlowCameraMode = "player" | "scripted";

export type QteOutcome = "success" | "failure" | null;

export type FlowVec3 = readonly [number, number, number];

export type FlowCameraPose = {
  position: FlowVec3;
  target: FlowVec3;
  fov?: number;
};

export type FlowCameraShot = {
  from: FlowCameraPose;
  to: FlowCameraPose;
};

export type FlowCameraContext = {
  playerPosition: { x: number; y: number; z: number };
  playerHeading: number;
  terrainHeight: (x: number, z: number) => number;
};

export type FlowCameraResolver = (context: FlowCameraContext) => FlowCameraShot;

export type FlowQteConfig = {
  prompt: string;
  detail: string;
  keys: readonly string[];
  labels: readonly string[];
  durationMs: number;
};

type FlowStepBase = {
  id: string;
  durationMs: number;
  title: string;
  caption: string;
  camera: FlowCameraResolver;
};

export type FlowCutsceneStep = FlowStepBase & { type: "cutscene" };

export type FlowQteStep = FlowStepBase & {
  type: "qte";
  qte: FlowQteConfig;
};

export type FlowStep = FlowCutsceneStep | FlowQteStep;

export type FlowScript = {
  id: string;
  steps: readonly FlowStep[];
};

export type FlowQteSnapshot = FlowQteConfig & {
  id: string;
  outcome: QteOutcome;
};

export type FlowSnapshot = {
  phase: FlowPhase;
  sequenceId: string | null;
  stepId: string | null;
  title: string | null;
  caption: string | null;
  camera: FlowCameraMode;
  cameraEpoch: number;
  qte: FlowQteSnapshot | null;
  qteOutcomes: Readonly<Record<string, QteOutcome>>;
};

export type FlowRuntime = {
  phase: FlowPhase;
  sequenceId: string | null;
  stepId: string | null;
  elapsedMs: number;
  stepDurationMs: number;
  camera: FlowCameraMode;
  cameraEpoch: number;
  qteOutcomes: Readonly<Record<string, QteOutcome>>;
};
