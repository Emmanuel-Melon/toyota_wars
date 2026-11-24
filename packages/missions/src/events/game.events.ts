import type { Team } from "../missions.types";
import { createEventBus } from "./event-bus";

export interface GameEvents {
  unitDestroyed: { unitId: string; killerTeam?: Team; victimTeam?: Team };
  playerDestroyed: Record<string, never>;
}

export const createGameEventBus = () => createEventBus<GameEvents>();
