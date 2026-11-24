// apps/toyota-wars/lib/missions/definition/mission-extensions.helpers.ts
import type {
  BaseCutsceneDef,
  BaseQteDef,
  MissionExtensions,
} from "./missions-extensions.types";

export function defineMissionExtensions<
  TCutsceneMap extends Record<string, BaseCutsceneDef> = Record<string, never>,
  TQteMap extends Record<string, BaseQteDef> = Record<string, never>,
  TCustomState = Record<string, never>,
>(
  extensions: MissionExtensions<TCutsceneMap, TQteMap, TCustomState>,
): MissionExtensions<TCutsceneMap, TQteMap, TCustomState> {
  return extensions;
}