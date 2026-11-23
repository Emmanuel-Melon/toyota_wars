// lib/missions/engine/mission.run.types.ts
import type { ObjectiveKind } from "@/lib/missions/definition/mission.constants";
import type { Team, Vec2 } from "@/lib/missions/definition/mission.types";

/** Types for the mutable state of one mission run (see mission.run.ts). */

export type MissionStatus =
  "idle" | "briefing" | "active" | "success" | "failed";

export type ObjectiveStatus = "pending" | "complete" | "failed";

/** The runner's read-only view of a squad. Owned by MissionRun. */
export interface SquadTracker {
  spawned: boolean;
  total: number;
  alive: number;
  leadersTotal: number;
  leadersAlive: number;
}

export interface TrackedUnit {
  squadId: string;
  team: Team;
  isLeader: boolean;
  alive: boolean;
}

export interface RouteProgress {
  squadId: string;
  waypointIndex: number;
  waypointCount: number;
  arrivedAt: number | null;
  currentPoint: Vec2;
  destination: Vec2;
}

export interface ZoneRuntimeState {
  controllingTeam: Team | null;
  capturingTeam: Team | null;
  captureProgress: number;
  contested: boolean;
}

export interface ScheduledSpawn {
  squadId: string;
  at: number;
}

export interface ObjectiveProgress {
  id: string;
  title: string;
  required: boolean;
  hidden: boolean;
  kind: ObjectiveKind;
  status: ObjectiveStatus;
  current: number;
  target: number;
  progress: number;
}

export interface MissionNotice {
  id: number;
  title: string;
  detail: string;
  expiresAt: number;
}

export interface MissionResult {
  missionId: string;
  outcome: "success" | "failed";
  elapsedSeconds: number;
  objectives: Pick<ObjectiveProgress, "id" | "title" | "required" | "status">[];
  xp: number;
  unlocks: string[];
}
