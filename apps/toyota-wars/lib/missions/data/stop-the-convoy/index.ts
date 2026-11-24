import type { GameMissionBundle } from "../../missions.registry";
import { stopTheConvoy } from "./mission";

export const stopTheConvoyBundle: GameMissionBundle = {
  mission: stopTheConvoy,
};
