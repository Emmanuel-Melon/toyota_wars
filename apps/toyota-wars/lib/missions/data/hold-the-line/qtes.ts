// hold-the-line/qtes.ts
import { createQte, qteInput } from "@/lib/mission-flow/qte/createQte";
import { evadeShot } from "./cutscenes";
import { ARTILLERY_SQUAD_ID, EVADE_QTE_ID } from "./ids";

export const evadeQte = createQte({
  id: EVADE_QTE_ID,
  title: "EVASIVE ACTION",
  caption: "The first salvo is inbound.",
  shot: evadeShot,
  durationMs: 4200,
  skippable: false,
  prompts: [
    {
      id: "dodge",
      text: "DODGE THE SALVO",
      detail: "Press X before impact.",
      startMs: 200,
      endMs: 2200,
      inputs: [qteInput("evade", "X", ["x"])],
      resolve: "any",
      failFast: true, // the bomb lands, so there's nothing left to play
      onHit: [{ type: "notice", title: "CLOSE CALL", detail: "The shells land behind you." }],
      onMiss: [{ type: "destroyPlayer", cause: "artillery-salvo" }],
    },
    {
      id: "return-fire",
      text: "RETURN FIRE",
      detail: "Press Z to suppress the battery.",
      startMs: 2400,
      endMs: 4200,
      required: false, // bonus: a miss doesn't fail the QTE
      inputs: [qteInput("shoot", "Z", ["z"])],
      resolve: "any",
      onHit: [{ type: "damageSquad", squadId: ARTILLERY_SQUAD_ID, amount: 0.25 }],
    },
  ],
  on: {
    succeed: [{ type: "setFlag", key: "evaded-salvo", value: true }],
    fail: [{ type: "notice", title: "DIRECT HIT", detail: "You didn't clear the blast." }],
  },
});