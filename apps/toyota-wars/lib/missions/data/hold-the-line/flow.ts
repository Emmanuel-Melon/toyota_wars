import type { FlowScript } from "@/lib/mission-flow/mission-flow.types";
import { flankCutscene } from "./cutscenes";
import { evadeQte } from "./qtes";

export const HOLD_THE_LINE_FLOW_ID = "hold-the-line-opening";

export const flow: FlowScript = {
  id: HOLD_THE_LINE_FLOW_ID,
  steps: [flankCutscene, evadeQte],
};
