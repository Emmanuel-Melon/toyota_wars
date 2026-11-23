import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { createSpawns } from "@/lib/map/map.spawns";
import { PLAINS_MAP } from "@/lib/map/maps/plains";
import { BattleRoster, type RosterSquadSpawn } from "@/lib/squad/squad.roster";

export const ALLY_SPAWNS = createSpawns(PLAINS_MAP.allySpawns);

export const OPPONENT_SPAWNS = createSpawns(PLAINS_MAP.opponentSpawns);

export const SKIRMISH_SQUADS: readonly RosterSquadSpawn[] = [
  {
    id: "vanguard",
    team: "ally",
    initialOrder: "follow",
    units: ALLY_SPAWNS.map((spawn) => ({
      template: "medium",
      spawn,
      maxHealth: COMBAT_CONFIG.MAX_HEALTH,
    })),
  },
  {
    id: "warband",
    team: "enemy",
    initialOrder: "attack",
    units: OPPONENT_SPAWNS.map((spawn, index) => ({
      template: "medium",
      spawn,
      maxHealth: COMBAT_CONFIG.MAX_HEALTH,
      isLeader: index === 0,
    })),
  },
];

export function createSkirmishRoster(): BattleRoster {
  const roster = new BattleRoster();
  roster.registerPlayer(
    COMBAT_CONFIG.PLAYER_ID,
    COMBAT_CONFIG.PLAYER_MAX_HEALTH,
  );
  for (const squad of SKIRMISH_SQUADS) roster.addSquad(squad);
  return roster;
}
