import type { MissionInput } from "@toyota/missions";

export const FIRST_CONTACT_CHECKPOINT_ID = "first-contact-checkpoint";

export const structures: NonNullable<MissionInput["arena"]["structures"]> = [
  {
    id: FIRST_CONTACT_CHECKPOINT_ID,
    structure: "checkpoint",
    anchor: "spawn",
    position: { x: 28, z: 215 },
    yaw: Math.PI,
    width: 20,
    depth: 16,
    height: 3,
  },
];
