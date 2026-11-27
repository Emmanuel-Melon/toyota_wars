import { noEffects, type MissionInput } from "@toyota/missions";
import { FIRST_CONTACT_CHECKPOINT_ID } from "./structures";

export const checkpointGarrison: MissionInput["squads"][number] = {
  id: "checkpoint-garrison",
  team: "ally",
  units: [{ template: "medium" }, { template: "medium" }],
  spawnPoints: [
    { x: -6.5, z: -1.6, yaw: 0.3 },
    { x: 6.5, z: -1.6, yaw: -0.3 },
  ],
  spawnLayout: "authored",
  spawnAnchor: {
    structureId: FIRST_CONTACT_CHECKPOINT_ID,
    role: "vehicle",
    holdPosition: true,
  },
  formation: "line",
  spacing: 13,
  holdFormation: true,
  personality: { aggression: 0.35, caution: 0.8 },
  initialOrder: "patrol",
  ...noEffects(),
};
