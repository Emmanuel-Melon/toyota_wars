import { useMemo } from "react";
import { useArena } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";
import type { HealthMap, PartHealthMap, Team } from "@toyota/combat";
import type { RosterSquad, RosterUnit } from "@/lib/squad/squad.roster";
import type { Obstacle } from "@/lib/movement/movement.types";
import {
  filterSquadsByTeam,
  groupTankUnitsBySquad,
} from "../squad-vehicles.utils";

export type TeamSquadVehicleData = {
  squads: RosterSquad[];
  unitsBySquad: Map<string, RosterUnit[]>;
  health: HealthMap;
  partHealth?: PartHealthMap;
  obstacles: readonly Obstacle[];
  bound: number;
};

/**
 * Shared data-gathering for any "render this team's squads" view.
 * Does NOT touch `usePlayer` — that's ally-specific business logic.
 */
export function useTeamSquadVehicles(team: Team): TeamSquadVehicleData {
  const { health, partHealth, squads, units } = useCombat();
  const arena = useArena();

  const teamSquads = useMemo(
    () => filterSquadsByTeam(squads, team),
    [squads, team],
  );
  const unitsBySquad = useMemo(() => groupTankUnitsBySquad(units), [units]);

  return {
    squads: teamSquads,
    unitsBySquad,
    health,
    partHealth,
    obstacles: arena.obstacles,
    bound: arena.bound,
  };
}
