import type { MissionInput } from "@toyota/missions";

export const structures: NonNullable<MissionInput["arena"]["structures"]> = [
  {
    id: "first-contact-checkpoint",
    structure: "checkpoint",
    anchor: "spawn",
    position: { x: 28, z: 215 },
    yaw: Math.PI,
    width: 20,
    depth: 16,
    height: 3,
  },
];
