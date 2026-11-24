import type { Mission, Team } from "../missions.types";
import {
  assertKnownTemplates,
  assertKnownVehicleModels,
  assertSingleAllyRadar,
} from "../missions.validation";

export interface MissionUnitTemplate<TPalette = unknown> {
  id: string;
  model?: string;
  palettes?: {
    ally: readonly TPalette[];
    enemy: readonly TPalette[];
  };
}

export type MissionUnitTemplateRegistry<TPalette = unknown> = Readonly<
  Record<string, MissionUnitTemplate<TPalette>>
>;

export interface MissionTemplateCheckOptions {
  radarTemplateId: string;
  radarModelId: string;
}

export function missionTemplateIds<TPalette>(
  templates: MissionUnitTemplateRegistry<TPalette>,
): string[] {
  return Object.keys(templates);
}

export function missionVehicleModelIds<TPalette>(
  templates: MissionUnitTemplateRegistry<TPalette>,
): string[] {
  const models = new Set<string>();
  for (const template of Object.values(templates)) {
    if (template.model) models.add(template.model);
  }
  return [...models];
}

export function assertMissionTemplates<TPalette>(
  missions: readonly Mission[],
  templates: MissionUnitTemplateRegistry<TPalette>,
  options: MissionTemplateCheckOptions,
): void {
  assertKnownTemplates(missions, missionTemplateIds(templates));
  assertKnownVehicleModels(missions, missionVehicleModelIds(templates));
  assertSingleAllyRadar(
    missions,
    options.radarTemplateId,
    options.radarModelId,
  );
}

export function missionUnitId(
  team: Team,
  squadId: string,
  index: number,
): string {
  return `${team}-${squadId}-${index}`;
}
