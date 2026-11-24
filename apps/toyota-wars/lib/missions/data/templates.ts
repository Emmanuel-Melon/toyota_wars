import {
  assertMissionTemplates as assertPackageMissionTemplates,
  type Mission,
  type Personality,
} from "@toyota/missions";

import {
  ALLY_PALETTES,
  ENEMY_PALETTES,
  type VehiclePalette,
} from "@/lib/palettes";
import type { VehicleModelId } from "@/lib/vehicles/vehicle.types";

export const UNIT_TEMPLATE_IDS = ["light", "medium", "heavy", "radar"] as const;

export type UnitTemplateId = (typeof UNIT_TEMPLATE_IDS)[number];

export type UnitTemplate = {
  id: UnitTemplateId;
  label: string;
  model: VehicleModelId;
  maxHealth: number;
  damageScale: number;
  traits: Personality;
  palettes: {
    ally: readonly VehiclePalette[];
    enemy: readonly VehiclePalette[];
  };
};

export const UNIT_TEMPLATES: Record<UnitTemplateId, UnitTemplate> = {
  light: {
    id: "light",
    label: "Light",
    model: "hilux",
    maxHealth: 240,
    damageScale: 0.8,
    traits: { aggression: 0.7, caution: 0.3 },
    palettes: {
      ally: [ALLY_PALETTES.sand],
      enemy: [ENEMY_PALETTES.steel],
    },
  },
  medium: {
    id: "medium",
    label: "Medium",
    model: "land-cruiser",
    maxHealth: 400,
    damageScale: 1,
    traits: { aggression: 0.55, caution: 0.5 },
    palettes: {
      ally: [ALLY_PALETTES.tan, ALLY_PALETTES.terracotta],
      enemy: [ENEMY_PALETTES.slate, ENEMY_PALETTES.olive],
    },
  },
  heavy: {
    id: "heavy",
    label: "Heavy",
    model: "hiace",
    maxHealth: 640,
    damageScale: 1.25,
    traits: { aggression: 0.4, caution: 0.7 },
    palettes: {
      ally: [ALLY_PALETTES.terracotta],
      enemy: [ENEMY_PALETTES.olive],
    },
  },
  radar: {
    id: "radar",
    label: "Radar",
    model: "radar",
    maxHealth: 420,
    damageScale: 0.7,
    traits: { aggression: 0.2, caution: 0.9 },
    palettes: {
      ally: [ALLY_PALETTES.sand],
      enemy: [ENEMY_PALETTES.steel],
    },
  },
};

export function assertMissionTemplates(missions: readonly Mission[]): void {
  assertPackageMissionTemplates(missions, UNIT_TEMPLATES, {
    radarTemplateId: "radar",
    radarModelId: "radar",
  });
}
