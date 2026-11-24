import type { FlowQteStep } from "@/lib/mission-flow/mission-flow.types";
import { evade } from "./cutscenes";

export const EVADE_QTE_ID = "hold-the-line-evade";

export const evadeQte: FlowQteStep = {
  type: "qte",
  id: EVADE_QTE_ID,
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
};

export const qtes = {
  [EVADE_QTE_ID]: evadeQte,
} satisfies Record<string, FlowQteStep>;
