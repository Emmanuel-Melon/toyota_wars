// apps/toyota-wars/feature/squad/squad-vehicles-list.tsx
import type { HealthMap, PartHealthMap } from "@toyota/combat";
import type { RosterSquad, RosterUnit } from "@/lib/squad/squad.roster";
import { SquadVehicles, type SquadShared } from "./squad-vehicles";
import { EMPTY_UNITS } from "../squad-vehicles.utils";

type SquadVehiclesListProps = {
  squads: readonly RosterSquad[];
  unitsBySquad: Map<string, RosterUnit[]>;
  health: HealthMap;
  partHealth?: PartHealthMap;
  /** Called once per squad — return the full `shared` for that squad. */
  buildShared: (squad: RosterSquad) => SquadShared;
  useLeader?: boolean;
};

/**
 * Pure mapping over squads → <SquadVehicles>. No data fetching, no
 * business rules — just consistent keying and the `EMPTY_UNITS` fallback.
 */
export function SquadVehiclesList({
  squads,
  unitsBySquad,
  health,
  partHealth,
  buildShared,
  useLeader = false,
}: SquadVehiclesListProps) {
  return (
    <>
      {squads.map((squad) => (
        <SquadVehicles
          key={squad.id}
          squad={squad}
          units={unitsBySquad.get(squad.id) ?? EMPTY_UNITS}
          health={health}
          partHealth={partHealth}
          shared={buildShared(squad)}
          useLeader={useLeader}
        />
      ))}
    </>
  );
}
