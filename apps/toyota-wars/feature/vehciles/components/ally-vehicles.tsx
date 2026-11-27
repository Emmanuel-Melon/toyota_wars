// apps/toyota-wars/feature/vehciles/components/ally-vehicles.tsx
"use client";

import { useCallback } from "react";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import type { Obstacle } from "@/lib/movement/movement.types";
import type { RosterSquad } from "@/lib/squad/squad.roster";
import { useTeamSquadVehicles } from "../../squad/hooks/use-team-squad-vehicles";
import { SquadVehiclesList } from "../../squad/components/squad-vehicles-list";
import {
  directiveForInitialOrder,
  type SquadShared,
} from "../../squad/components/squad-vehicles";

type AllyVehiclesProps = {
  obstacles?: readonly Obstacle[];
};

export function AllyVehicles({ obstacles }: AllyVehiclesProps) {
  const {
    health,
    partHealth,
    allyDirective,
    allyOrdersIssued,
    allyFormation,
    fireDesignation,
    attackOrder,
  } = useCombat();
  const { playerBody: leader, destroyed } = usePlayer();
  const data = useTeamSquadVehicles("ally");
  const squadObstacles = obstacles ?? data.obstacles;

  const buildShared = useCallback(
    (squad: RosterSquad): SquadShared => ({
      leader: squad.holdPosition || destroyed ? null : leader,
      obstacles: squadObstacles,
      bound: data.bound,
      formationType: allyFormation,
      holdFormation: squad.holdFormation,
      holdPosition: squad.holdPosition,
      directive: allyOrdersIssued
        ? allyDirective
        : directiveForInitialOrder(squad.initialOrder),
      isExplicitOrder: allyOrdersIssued,
      fireDesignation,
      attackOrder,
    }),
    [
      leader,
      destroyed,
      squadObstacles,
      data.bound,
      allyFormation,
      allyDirective,
      allyOrdersIssued,
      fireDesignation,
      attackOrder,
    ],
  );

  return (
    <SquadVehiclesList
      squads={data.squads}
      unitsBySquad={data.unitsBySquad}
      health={health}
      partHealth={partHealth}
      buildShared={buildShared}
    />
  );
}
