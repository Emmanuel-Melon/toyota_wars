// lib/missions/engine/mission.triggers.ts
import {
  TEAM,
  TRIGGER_TYPE,
} from "@/lib/missions/definition/mission.constants";
import type { Mission } from "@/lib/missions/definition/mission.types";
import type { MissionRun } from "./mission.run";
import type { ScheduledSpawn } from "./mission.run.types";

/** Spawns scheduled when the mission goes active (start + time triggers). */
export function initialPendingSpawns(mission: Mission): ScheduledSpawn[] {
  return mission.squads
    .filter(
      (s) =>
        s.trigger.type === TRIGGER_TYPE.START ||
        s.trigger.type === TRIGGER_TYPE.TIME,
    )
    .map((s) => ({
      squadId: s.id,
      at: s.trigger.type === TRIGGER_TYPE.TIME ? s.trigger.atSeconds : 0,
    }));
}

/** Spawns scheduled because `destroyedSquadId` just died. */
export function pendingSpawnsOnSquadDestroyed(
  mission: Mission,
  destroyedSquadId: string,
  elapsed: number,
): ScheduledSpawn[] {
  return mission.squads
    .filter(
      (s) =>
        s.trigger.type === TRIGGER_TYPE.SQUAD_DESTROYED &&
        s.trigger.squadId === destroyedSquadId,
    )
    .map((s) => ({
      squadId: s.id,
      // narrowing loses the discriminant inside .map — re-read via find
      at: elapsed + squadDestroyedDelay(mission, s.id),
    }));
}

function squadDestroyedDelay(mission: Mission, squadId: string): number {
  const squad = mission.squads.find((s) => s.id === squadId);
  return squad?.trigger.type === TRIGGER_TYPE.SQUAD_DESTROYED
    ? squad.trigger.delaySeconds
    : 0;
}

/** Remove and return the squad ids whose spawn time has come. */
export function takeDueSpawns(run: MissionRun, elapsed: number): string[] {
  const due = run.pendingSpawns.filter((p) => p.at <= elapsed);
  if (due.length === 0) return [];
  run.pendingSpawns = run.pendingSpawns.filter((p) => p.at > elapsed);
  return due.map((p) => p.squadId);
}

/** Next unspawned enemy squad after the given one (for {next} in notices). */
export function nextUnspawnedEnemySquad(
  run: MissionRun,
  mission: Mission,
  afterSquadId: string,
) {
  return mission.squads.find(
    (candidate) =>
      candidate.team === TEAM.ENEMY &&
      candidate.id !== afterSquadId &&
      !run.squads.get(candidate.id)?.spawned,
  );
}
