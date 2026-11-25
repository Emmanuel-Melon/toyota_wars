// qte/createQte.ts
import type { FlowQteStep } from "../mission-flow.types";
import {
  onPlayer,
  rel,
  type CameraShotSpec,
} from "../camera/camera.types";
import { createCameraResolver } from "../camera/camera.resolve";
import type { QteInput, QteSpec } from "./qte.types";

export interface QteStepSpec extends QteSpec {
  id: string;
  title: string;
  caption?: string;
  shot?: CameraShotSpec;
}

// Default: slow push-in from behind and above the player. Used when a QTE
// doesn't need bespoke camera work (e.g. radio confirmations).
const DEFAULT_QTE_SHOT: CameraShotSpec = {
  from: { position: rel(0, -7, 3.4), target: onPlayer(1.2), fov: 50 },
  to: { position: rel(0, -5, 3.0), target: onPlayer(1.2), fov: 50 },
};

export const qteInput = (id: string, label: string, keys: string[] = [id], effects?: QteInput["effects"]): QteInput =>
  ({ id, label, keys, effects });

// qte/createQte.ts (only the return changes)
export function createQte({ id, title, caption, shot = DEFAULT_QTE_SHOT, ...qte }: QteStepSpec): FlowQteStep {
  const normalized: QteSpec = {
    ...qte,
    prompts: qte.prompts.map((p) => ({
      ...p,
      inputs: p.inputs.map((i) => ({ ...i, keys: i.keys.map((k) => k.toLowerCase()) })),
    })),
  };
  return {
    type: "qte",
    id,
    title,
    caption: caption ?? "",
    durationMs: normalized.durationMs, // single source of truth stays in the spec
    camera: createCameraResolver(shot),
    qte: normalized,
  };
}