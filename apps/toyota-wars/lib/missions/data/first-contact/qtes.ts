import { createQte, qteInput } from "@/lib/mission-flow/qte/createQte";
import { ACKNOWLEDGE_CONTACT_QTE_ID } from "./ids";

export const acknowledgeContactQte = createQte({
  id: ACKNOWLEDGE_CONTACT_QTE_ID,
  title: "RADIO CONTACT",
  caption: "Command is requesting confirmation.",
  durationMs: 2400,
  skippable: true,

  prompts: [
    {
      id: "confirm-contact",
      text: "CONFIRM CONTACT",
      detail: "Press X to transmit your report.",
      startMs: 200,
      endMs: 2200,
      inputs: [qteInput("transmit", "X", ["x"])],
      resolve: "any",
      failFast: false,

      onHit: [
        {
          type: "notice",
          title: "TRANSMISSION SENT",
          detail: "Command has acknowledged your report.",
        },
      ],

      onMiss: [
        {
          type: "notice",
          title: "SIGNAL LOST",
          detail: "The report is repeated over an unstable connection.",
        },
      ],
    },
  ],

  on: {
    succeed: [
      {
        type: "setFlag",
        key: "contact-confirmed",
        value: true,
      },
    ],
  },
});
