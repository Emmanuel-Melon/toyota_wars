// toyota-wars/feature/squad/squad-vehicles.tsx
"use client";

import { useMemo } from "react";
import {
  createFireRequest,
  projectPartHealth,
  type HealthMap,
  type PartHealthMap,
  type Team,
} from "@toyota/combat";
import type { Obstacle, TankLeader } from "@/lib/movement/movement.types";
import { resolveVehicleLoadout } from "@/lib/vehicles/vehicle.config";
import { TANK_CONFIG } from "@/lib/agents/agent-runtime.config";
import {
  SQUAD_DIRECTIVE,
  type AllyAttackOrder,
  type FireDesignation,
  type SquadDirective,
} from "@/lib/squad/squad.types";
import type { InitialOrder, SquadFireMode } from "@toyota/missions";
import { useMission } from "@/context/missions.context";
import type { RosterSquad, RosterUnit } from "@/lib/squad/squad.roster";
import {
  type FormationType,
  getFormationOffset,
} from "@/lib/tactics/tactics.formation";
import {
  useBattle,
  useProjectileSystem,
  useUnits,
} from "@/context/battle-context";
import { AIVehicle } from "../../vehciles/ai-vehicle";
import { useSquadOrchestration } from "../../vehciles/hooks/use-squad-orchestration";
import { SquadProvider } from "../../../context/squad-context";
import { useCombat } from "@/context/combat-context";

export type SquadShared = {
  leader?: TankLeader | null;
  obstacles?: readonly Obstacle[];
  bound?: number;
  retreatOnDamage?: boolean;
  formationType?: FormationType;
  formationSpacing?: number;
  holdFormation?: boolean;
  holdPosition?: boolean;
  fireMode?: SquadFireMode;
  directive?: SquadDirective;
  isExplicitOrder?: boolean;
  fireDesignation?: FireDesignation | null;
  attackOrder?: AllyAttackOrder | null;
};

type SquadVehiclesProps = {
  squad: RosterSquad;
  units: readonly RosterUnit[];
  health: HealthMap;
  partHealth?: PartHealthMap;
  shared?: SquadShared;
  useLeader?: boolean;
};

const GROUP_NAMES: Record<Team, string> = {
  ally: "allies",
  enemy: "opponents",
};

export function directiveForInitialOrder(order: InitialOrder): SquadDirective {
  switch (order) {
    case "attack":
      return SQUAD_DIRECTIVE.ADVANCE;
    case "flee":
      return SQUAD_DIRECTIVE.GENERAL_RETREAT;
    case "follow":
    case "patrol":
    default:
      return SQUAD_DIRECTIVE.HOLD;
  }
}

export function SquadVehicles({
  squad,
  units,
  health,
  partHealth,
  shared,
  useLeader = false,
}: SquadVehiclesProps) {
  const team = squad.team;
  const projectiles = useProjectileSystem();
  const { registry } = useBattle();
  const registeredUnits = useUnits();
  const mission = useMission();
  const { getPlayerAggro } = useCombat();
  const directiveView =
    mission.directives.find((directive) => directive.squadId === squad.id) ??
    null;
  const leaderId = useMemo(() => {
    if (!useLeader) return null;
    const preferred = squad.leaderId;
    if (preferred && (health[preferred] ?? 0) > 0) return preferred;
    const fallback = units.find(
      (unit) => (health[unit.id] ?? unit.maxHealth) > 0,
    );
    return fallback?.id ?? null;
  }, [useLeader, squad.leaderId, units, health]);
  const formationSlots = useMemo(() => {
    let nextSlot = 1;
    return units.map((unit) =>
      leaderId !== null && unit.id === leaderId ? 0 : nextSlot++,
    );
  }, [units, leaderId]);

  const loadouts = useMemo(
    () =>
      Object.fromEntries(
        units.map((unit) => [unit.id, resolveVehicleLoadout(unit.spawn)]),
      ),
    [units],
  );

  const livingCount = units.reduce(
    (count, unit) => count + ((health[unit.id] ?? unit.maxHealth) > 0 ? 1 : 0),
    0,
  );
  const routed =
    units.length > 0 &&
    units.length - livingCount >=
      Math.ceil(units.length * TANK_CONFIG.combat.squadRoutLossFraction);

  const { targetPositionsRef, squadOrdersRef } = useSquadOrchestration({
    team,
    units,
    health,
    loadouts,
    registry,
    registeredUnits,
    directiveView,
    shared,
    leaderId,
    getPlayerAggro,
  });

  const squadContext = useMemo(
    () => ({
      team,
      obstacles: shared?.obstacles ?? [],
      targetPositionsRef,
      squadOrdersRef,
      retreatOnDamage: shared?.retreatOnDamage ?? true,
      attackMode: shared?.directive === SQUAD_DIRECTIVE.ADVANCE,
    }),
    [team, shared],
  );

  const leaderUnit = leaderId !== null ? registry.get(leaderId) : undefined;

  return (
    <SquadProvider value={squadContext}>
      <group name={`${GROUP_NAMES[team]}-${squad.id}`}>
        {units.map((unit, i) => {
          const spawn = unit.spawn;
          if (!spawn) return null;

          const id = unit.id;
          const value = health[id] ?? unit.maxHealth;
          const formationOffset = shared?.formationType
            ? getFormationOffset(
                formationSlots[i],
                shared.formationType,
                shared.formationSpacing ?? 8,
              )
            : spawn.formationOffset;
          const vehicleSpawn = { ...spawn, formationOffset };
          const leader =
            shared?.leader ??
            (leaderUnit && id !== leaderId
              ? {
                  position: leaderUnit.position,
                  heading: leaderUnit.body.heading,
                  speed: leaderUnit.body.speed,
                }
              : null);

          return (
            <AIVehicle
              key={id}
              unitId={id}
              spawn={vehicleSpawn}
              isSquadLeader={leaderId !== null && id === leaderId}
              leader={leader}
              targetPosition={null}
              health={value}
              maxHealth={unit.maxHealth}
              destroyed={value <= 0}
              routed={routed}
              partHealth={projectPartHealth(
                partHealth ?? {},
                id,
                unit.maxHealth,
              )}
              fireWhileMoving
              onShoot={(
                pos,
                heading,
                pitch,
                spread,
                weapon,
                worldMuzzle,
                barrel,
              ) => {
                if (shared?.fireMode === "scripted") return;
                projectiles.current?.fire(
                  createFireRequest(
                    pos,
                    heading,
                    team,
                    weapon,
                    spread,
                    pitch,
                    team === "ally" ? TANK_CONFIG.combat.allyDamageScale : 1,
                    worldMuzzle,
                    undefined,
                    barrel,
                  ),
                );
              }}
            />
          );
        })}
      </group>
    </SquadProvider>
  );
}
