import type { GameMissionBundle } from "../../missions.registry";
import { flow } from "./flow";
import { holdTheLine } from "./mission";

export const holdTheLineBundle: GameMissionBundle = {
  mission: holdTheLine,
  flow,
};
