"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { DEFAULT_ARENA } from "@/lib/map/arena";
import type { MapPosition, VehicleSpawn } from "@/lib/map/map.types";
import { MissionRunner } from "@/lib/missions/runtime/mission.runner";
import type { MissionHost } from "@/lib/missions/host/mission.host";
import { MissionContext } from "@/context/missions.context";
import type {
  Mission,
  Squad,
  Vec2,
} from "@/lib/missions/definition/mission.types";
import {
  UNIT_TEMPLATES,
  type UnitTemplateId,
} from "@/lib/missions/missions.templates";
import type { RosterSquadSpawn } from "@/lib/squad/squad.roster";
import { SKIRMISH_SQUADS } from "@/feature/vehciles/spawns";
import { useArenaControls } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";

type MissionSessionValue = {
  runner: MissionRunner;
  startMission: (mission: Mission) => void;
  retryMission: () => void;
  returnToSkirmish: () => void;
};

const MissionSessionCtx = createContext<MissionSessionValue | null>(null);

function headingToward(from: Vec2, to: Vec2): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

function paletteFor(template: UnitTemplateId, squad: Squad, index: number) {
  const palettes = UNIT_TEMPLATES[template].palettes[squad.team];
  return palettes[index % palettes.length];
}

function missionSquadSpawn(squad: Squad, playerSpawn: Vec2): RosterSquadSpawn {
  const units = squad.units.map((unit, index) => {
    const point = squad.spawnPoints[index % squad.spawnPoints.length];
    const position: [number, number] = [point.x, point.z];
    const rotationY = headingToward(point, playerSpawn);
    const spawn: VehicleSpawn = {
      position,
      rotationY,
      palette: paletteFor(unit.template as UnitTemplateId, squad, index),
      formationOffset: undefined,
    };

    return {
      template: unit.template as UnitTemplateId,
      spawn,
      maxHealth: UNIT_TEMPLATES[unit.template as UnitTemplateId].maxHealth,
      isLeader: unit.isLeader,
    };
  });

  return {
    id: squad.id,
    team: squad.team,
    units,
    initialOrder: squad.initialOrder,
    personality: squad.personality,
  };
}

export function MissionSessionProvider({ children }: { children: ReactNode }) {
  const { roster, events, resetBattle } = useCombat();
  const { setArenaSource } = useArenaControls();
  const playerSpawn = useRef<Vec2>(DEFAULT_ARENA.arena.playerSpawn);
  const lastMission = useRef<Mission | null>(null);

  const host = useMemo<MissionHost>(
    () => ({
      setupArena(arena, squads, clearancePoints = []) {
        playerSpawn.current = arena.playerSpawn;
        setArenaSource({
          arena,
          squads,
          structureSeed: arena.seed,
          clearancePoints: clearancePoints.map((point): MapPosition => [
            point.x,
            point.z,
          ]),
        });
        resetBattle();
        roster.registerPlayer(
          COMBAT_CONFIG.PLAYER_ID,
          COMBAT_CONFIG.PLAYER_MAX_HEALTH,
        );
      },
      spawnSquad(squad) {
        const spawned = roster.addSquad(
          missionSquadSpawn(squad, playerSpawn.current),
        );
        return spawned.map((unit) => ({
          unitId: unit.id,
          isLeader: unit.isLeader,
        }));
      },
      resetPlayerHealth() {
        roster.healUnit(
          COMBAT_CONFIG.PLAYER_ID,
          COMBAT_CONFIG.PLAYER_MAX_HEALTH,
        );
      },
      cleanup() {
        resetBattle();
      },
    }),
    [resetBattle, roster, setArenaSource],
  );

  const [runner] = useState(() => new MissionRunner(host));

  useEffect(() => runner.attach(events), [runner, events]);

  const startMission = useCallback(
    (mission: Mission) => {
      lastMission.current = mission;
      runner.load(mission);
      runner.start();
    },
    [runner],
  );

  const retryMission = useCallback(() => {
    const mission = lastMission.current;
    if (!mission) return;
    runner.load(mission);
    runner.start();
  }, [runner]);

  const returnToSkirmish = useCallback(() => {
    runner.reset();
    lastMission.current = null;
    setArenaSource(DEFAULT_ARENA);
    resetBattle();
    roster.registerPlayer(
      COMBAT_CONFIG.PLAYER_ID,
      COMBAT_CONFIG.PLAYER_MAX_HEALTH,
    );
    for (const squad of SKIRMISH_SQUADS) roster.addSquad(squad);
  }, [resetBattle, roster, runner, setArenaSource]);

  const value = useMemo<MissionSessionValue>(
    () => ({ runner, startMission, retryMission, returnToSkirmish }),
    [runner, startMission, retryMission, returnToSkirmish],
  );

  return (
    <MissionContext.Provider value={runner}>
      <MissionSessionCtx.Provider value={value}>
        {children}
      </MissionSessionCtx.Provider>
    </MissionContext.Provider>
  );
}

export function useMissionSession(): MissionSessionValue {
  const value = useContext(MissionSessionCtx);
  if (!value)
    throw new Error(
      "useMissionSession must be used inside MissionSessionProvider",
    );
  return value;
}
