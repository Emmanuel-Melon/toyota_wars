import type { FlowScript } from "@/lib/mission-flow/mission-flow.types";
import {
  createMissionsRegistry,
  type Mission,
  type MissionInput,
} from "@toyota/missions";

export type GameMissionEntry = {
  mission: Mission;
  flow?: FlowScript;
  tutorial?: boolean;
};

export type GameMissionBundle = {
  mission: MissionInput;
  flow?: FlowScript;
  tutorial?: boolean;
};

export const missionRegistry = createMissionsRegistry<GameMissionEntry>();

export function registerMission(entry: GameMissionEntry): void {
  missionRegistry.register(entry.mission.id, entry);
}

export function getMission(id: string): Mission | undefined {
  return missionRegistry.get(id)?.mission;
}

export function requireMission(id: string): Mission {
  return missionRegistry.require(id).mission;
}

export function allMissions(): Mission[] {
  return missionRegistry.all().map((entry) => entry.mission);
}

export function allOrderedMissions(): Mission[] {
  return allMissions().sort((a, b) => a.order - b.order);
}

export function getMissionFlow(id: string): FlowScript | undefined {
  return missionRegistry.get(id)?.flow;
}

export function tutorialMissionId(): string {
  const tutorial = missionRegistry.all().find((entry) => entry.tutorial);
  if (!tutorial) {
    throw new Error("[missions] No tutorial mission registered.");
  }
  return tutorial.mission.id;
}
