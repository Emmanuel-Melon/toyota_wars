// apps/toyota-wars/lib/missions/definition/mission-extensions.types.ts
import type { z } from "zod";
import type { Mission } from "./missions.types";

export type CutsceneTrigger =
  | "onMissionStart"
  | "onObjectiveComplete"
  | "onSquadDestroyed"
  | "onMissionEnd";

export interface BaseCutsceneDef {
  readonly id: string;
  readonly trigger: CutsceneTrigger;
  readonly skippable: boolean;
  readonly cameraPreset: string;
  readonly dialogueKeys?: readonly string[];
}

export type QteInputPrompt = "SPACE" | "E" | "F" | "LMB" | "RMB";

export interface BaseQteDef<TPayload = unknown> {
  readonly id: string;
  readonly prompt: QteInputPrompt;
  readonly durationMs: number;
  readonly payloadSchema?: z.ZodType<TPayload>;
}

export interface MissionRuntimeContext<TCustomState = Record<string, unknown>> {
  readonly mission: Mission;
  readonly elapsedMs: number;
  readonly state: TCustomState;
  playCutscene: (cutsceneId: string) => Promise<void>;
  triggerQte: (qteId: string, rawPayload?: unknown) => Promise<boolean>;
}

export interface MissionLifecycleHooks<
  TCutsceneMap extends Record<string, BaseCutsceneDef> = Record<string, BaseCutsceneDef>,
  TQteMap extends Record<string, BaseQteDef> = Record<string, BaseQteDef>,
  TCustomState = Record<string, unknown>,
> {
  onStart?: (ctx: MissionRuntimeContext<TCustomState>) => void | Promise<void>;
  onTick?: (ctx: MissionRuntimeContext<TCustomState>, deltaMs: number) => void;
  onObjectiveComplete?: (
    objectiveId: string,
    ctx: MissionRuntimeContext<TCustomState>,
  ) => void | Promise<void>;
  onCutsceneEnd?: (
    cutscene: TCutsceneMap[keyof TCutsceneMap],
    ctx: MissionRuntimeContext<TCustomState>,
  ) => void | Promise<void>;
  onQteResult?: (
    qte: TQteMap[keyof TQteMap],
    succeeded: boolean,
    ctx: MissionRuntimeContext<TCustomState>,
  ) => void | Promise<void>;
  onComplete?: (ctx: MissionRuntimeContext<TCustomState>) => void | Promise<void>;
  onFail?: (reason: string, ctx: MissionRuntimeContext<TCustomState>) => void | Promise<void>;
}

export interface MissionExtensions<
  TCutsceneMap extends Record<string, BaseCutsceneDef> = Record<string, BaseCutsceneDef>,
  TQteMap extends Record<string, BaseQteDef> = Record<string, BaseQteDef>,
  TCustomState = Record<string, unknown>,
> {
  readonly cutscenes?: TCutsceneMap;
  readonly qtes?: TQteMap;
  readonly createInitialState?: () => TCustomState;
  readonly hooks?: MissionLifecycleHooks<TCutsceneMap, TQteMap, TCustomState>;
}