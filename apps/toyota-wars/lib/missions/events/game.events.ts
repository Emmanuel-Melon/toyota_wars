// lib/missions/events/game.events.ts
import type { Team } from "@/lib/combat/combat.types";
import { createEventBus } from "./event-bus";

/**
 * The only contract between the game and the mission layer.
 * The game emits these; it knows nothing about missions, objectives or squads.
 * The runner resolves team/squad/leader from its own registry.
 */
export interface GameEvents {
  /** Any non-player unit reaching 0 health. */
  unitDestroyed: { unitId: string; killerTeam?: Team; victimTeam?: Team };
  playerDestroyed: Record<string, never>;
}

export const createGameEventBus = () => createEventBus<GameEvents>();
