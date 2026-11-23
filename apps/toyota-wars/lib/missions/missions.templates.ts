// apps/toyota-wars/lib/missions/missions.templates.ts
import {
  ALLY_PALETTES,
  ENEMY_PALETTES,
  type VehiclePalette,
} from "../palettes";
import type { Mission, Personality } from "./definition/mission.types";
import { assertKnownTemplates } from "./definition/mission.validation";

export const UNIT_TEMPLATE_IDS = ["light", "medium", "heavy"] as const;

export type UnitTemplateId = (typeof UNIT_TEMPLATE_IDS)[number];

export type UnitTemplate = {
  id: UnitTemplateId;
  label: string;
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
    maxHealth: 640,
    damageScale: 1.25,
    traits: { aggression: 0.4, caution: 0.7 },
    palettes: {
      ally: [ALLY_PALETTES.terracotta],
      enemy: [ENEMY_PALETTES.olive],
    },
  },
};

export function assertMissionTemplates(missions: readonly Mission[]): void {
  assertKnownTemplates(missions, UNIT_TEMPLATE_IDS);
}
