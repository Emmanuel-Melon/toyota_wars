import { createCutscene } from "@/lib/mission-flow/cutscene/createCutscene";
import { rel, onPlayer, type CameraShotSpec } from "@/lib/mission-flow/camera/camera.types";
import {
  PATROL_OPENING_ID,
  HOSTILE_CONTACT_ID,
} from "./ids";

const patrolOpeningShot: CameraShotSpec = {
  from: {
    position: rel(-48, -36, 24),
    target: rel(-20, 20, 2),
    fov: 60,
  },
  to: {
    position: rel(-18, -16, 9),
    target: onPlayer(2.4),
    fov: 48,
  },
};

const hostileContactShot: CameraShotSpec = {
  from: {
    position: rel(32, -44, 18),
    target: rel(0, -100, 4),
    fov: 58,
  },
  to: {
    position: rel(18, -18, 8),
    target: onPlayer(2.4),
    fov: 48,
  },
};

export const patrolOpening = createCutscene({
  id: PATROL_OPENING_ID,
  title: "MORNING PATROL",
  caption: "The northern sector has been quiet for days.",
  durationMs: 4200,
  shot: patrolOpeningShot,
});

export const hostileContactCutscene = createCutscene({
  id: HOSTILE_CONTACT_ID,
  title: "UNIDENTIFIED CONTACT",
  caption: "Unidentified vehicles have appeared beyond the ridge.",
  durationMs: 3800,
  shot: hostileContactShot,
});