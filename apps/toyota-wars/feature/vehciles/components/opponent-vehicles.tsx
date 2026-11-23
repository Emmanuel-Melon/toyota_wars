// apps/toyota-wars/feature/vehciles/components/opponent-vehicles.tsx
"use client";

import { useCallback } from "react";
import { useCombat } from "@/context/combat-context";
import type { RosterSquad } from "@/lib/squad/squad.roster";
import { useTeamSquadVehicles } from "../../squad/hooks/use-team-squad-vehicles";
import { SquadVehiclesList } from "../../squad/components/squad-vehicles-list";
import {
  directiveForInitialOrder,
  type SquadShared,
} from "../../squad/components/squad-vehicles";

export function OpponentVehicles() {
  const { health, partHealth } = useCombat();
  const data = useTeamSquadVehicles("enemy");

  const buildShared = useCallback(
    (squad: RosterSquad): SquadShared => ({
      obstacles: data.obstacles,
      bound: data.bound,
      retreatOnDamage: false,
      formationType: "wedge",
      directive: directiveForInitialOrder(squad.initialOrder),
      isExplicitOrder: false,
    }),
    [data.bound, data.obstacles],
  );

  return (
    <SquadVehiclesList
      squads={data.squads}
      unitsBySquad={data.unitsBySquad}
      health={health}
      partHealth={partHealth}
      buildShared={buildShared}
      useLeader
    />
  );
}
