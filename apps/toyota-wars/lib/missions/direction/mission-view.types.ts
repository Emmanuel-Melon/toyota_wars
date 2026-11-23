import type { ObjectiveType } from "@/lib/missions/definition/mission.constants";
import type { Team, Vec2 } from "@/lib/missions/definition/mission.types";

export type MissionViewStatus =
  "idle" | "briefing" | "active" | "success" | "failed";

export type ObjectiveViewKind = "goal" | "constraint";

export type ObjectiveViewStatus = "pending" | "complete" | "failed";

export interface ZoneStateView {
  readonly id: string;
  readonly position: Vec2;
  readonly radius: number;
  readonly controllingTeam: Team | null;
  readonly capturingTeam: Team | null;
  readonly contested: boolean;
  readonly captureProgress: number;
}

export interface SquadStateView {
  readonly id: string;
  readonly team: Team;
  readonly spawned: boolean;
  readonly alive: number;
  readonly total: number;
  readonly center: Vec2 | null;
}

export interface RouteStateView {
  readonly squadId: string;
  readonly team: Team;
  readonly currentPoint: Vec2;
  readonly destination: Vec2;
  readonly waypointIndex: number;
  readonly waypointCount: number;
  readonly arrivedAt: number | null;
  readonly radius: number;
}

export type MissionNeed =
  | {
      readonly type: "eliminate";
      readonly team: Team;
      readonly squadId?: string;
      readonly remaining: number;
    }
  | {
      readonly type: "control-zone";
      readonly zoneId: string;
      readonly stopDistance?: number;
      readonly team: Team;
    }
  | {
      readonly type: "hold-zone";
      readonly zoneId: string;
      readonly stopDistance?: number;
      readonly team: Team;
      readonly seconds: number;
    }
  | {
      readonly type: "occupy-zone";
      readonly zoneId: string;
      readonly stopDistance?: number;
      readonly squadId: string;
    }
  | {
      readonly type: "presence";
      readonly zoneId: string;
      readonly stopDistance?: number;
      readonly squadId: string;
      readonly seconds: number;
    }
  | {
      readonly type: "reach-route";
      readonly squadId: string;
    }
  | {
      readonly type: "deny-route";
      readonly squadId: string;
    }
  | {
      readonly type: "preserve-squad";
      readonly squadId: string;
      readonly minAlive: number;
    }
  | {
      readonly type: "survive";
      readonly seconds: number;
    };

export interface ObjectiveStateView {
  readonly id: string;
  readonly title: string;
  readonly type: ObjectiveType;
  readonly kind: ObjectiveViewKind;
  readonly status: ObjectiveViewStatus;
  readonly current: number;
  readonly target: number;
  readonly progress: number;
  readonly required: boolean;
  readonly hidden: boolean;
  readonly need: MissionNeed;
}

export interface MissionStateView {
  readonly status: MissionViewStatus;
  readonly elapsed: number;
  readonly objectives: readonly ObjectiveStateView[];
  readonly zones: readonly ZoneStateView[];
  readonly squads: readonly SquadStateView[];
  readonly routes: readonly RouteStateView[];
}

export const SQUAD_DIRECTIVE_VIEW = {
  HOLD: "hold",
  ADVANCE: "advance",
  ENGAGE: "engage",
  DEFEND: "defend",
  ESCORT: "escort",
  INTERCEPT: "intercept",
} as const;

export type SquadDirectiveType =
  (typeof SQUAD_DIRECTIVE_VIEW)[keyof typeof SQUAD_DIRECTIVE_VIEW];

export type DirectiveTargetKind = "zone" | "route" | "squad" | "point" | "none";

export interface DirectiveTargetView {
  readonly kind: DirectiveTargetKind;
  readonly id?: string;
  readonly point: Vec2 | null;
  readonly radius?: number;
  readonly stopDistance?: number;
}

export interface DirectiveFlagsView {
  readonly primary?: boolean;
  readonly defensive?: boolean;
  readonly temporary?: boolean;
}

export interface SquadDirectiveView {
  readonly squadId: string;
  readonly directive: SquadDirectiveType;
  readonly target: DirectiveTargetView;
  readonly flags: DirectiveFlagsView;
}
