// hold-the-line/cutscenes.ts
import { createCutscene } from "@/lib/mission-flow/cutscene/createCutscene";
import {
  rel,
  onPlayer,
  type CameraShotSpec,
} from "@/lib/mission-flow/camera/camera.types";
import { FLANK_CUTSCENE_ID } from "./ids";

const wideShot: CameraShotSpec = {
  from: { position: rel(-52, -48, 28), target: rel(-72, -112, 2), fov: 58 },
  to: { position: rel(-24, -26, 12), target: onPlayer(2.4), fov: 52 },
};

export const evadeShot: CameraShotSpec = {
  from: { position: rel(14, -10, 5.5), target: rel(-8, 14, 2), fov: 54 },
  to: { position: rel(-12, -8, 5), target: onPlayer(2.2), fov: 48 },
};

export const flankCutscene = createCutscene({
  id: FLANK_CUTSCENE_ID,
  title: "FLANKING FIRE",
  caption: "Type 63 support is opening fire from the left flank.",
  durationMs: 3600,
  shot: wideShot,
});
