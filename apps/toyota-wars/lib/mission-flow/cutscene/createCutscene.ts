// cutscene/createCutscene.ts
import type {
  FlowCutsceneActor,
  FlowCutsceneStep,
} from "../mission-flow.types";
import type { CameraShotSpec } from "../camera/camera.types";
import { createCameraResolver } from "../camera/camera.resolve";

export interface CutsceneSpec {
  id: string;
  title: string;
  caption?: string;
  durationMs: number;
  shot: CameraShotSpec;
  actors?: readonly FlowCutsceneActor[];
  // storyline hooks, add these fields to FlowCutsceneStep when you're ready:
  // dialogue?: { speaker: string; text: string; atMs: number }[];
  // skippable?: boolean;
}

export function createCutscene({
  shot,
  caption = "",
  ...rest
}: CutsceneSpec): FlowCutsceneStep {
  return {
    type: "cutscene",
    ...rest,
    caption,
    camera: createCameraResolver(shot),
  };
}
