// apps/toyota-wars/lib/missions/definition/mission.types.ts
import type { z } from "zod";
import type { ObjectiveType } from "./mission.constants";
import type {
  ArenaSchema,
  FailConditionSchema,
  InitialOrderSchema,
  MissionBaseSchema,
  MissionRewardsSchema,
  MissionSchema,
  MissionZoneSchema,
  ObjectiveSchema,
  PersonalitySchema,
  RoadConfigSchema,
  SpawnTriggerSchema,
  SquadEffectSchema,
  SquadSchema,
  SquadUnitSchema,
  TeamSchema,
  Vec2Schema,
} from "./mission.schema";

/** Types only (no runtime code), so importing this file never pulls in zod. */

// ── Primitives ──
export type Vec2 = z.infer<typeof Vec2Schema>;
export type MissionZone = z.infer<typeof MissionZoneSchema>;
export type Personality = z.infer<typeof PersonalitySchema>;
export type InitialOrder = z.infer<typeof InitialOrderSchema>;
export type Team = z.infer<typeof TeamSchema>;

// ── Forces ──
export type SpawnTrigger = z.infer<typeof SpawnTriggerSchema>;
export type SquadTrigger = SpawnTrigger;
export type SquadUnit = z.infer<typeof SquadUnitSchema>;
export type Squad = z.infer<typeof SquadSchema>;
/** Parsed effect (all defaults applied). */
export type SquadEffect = z.infer<typeof SquadEffectSchema>;
/** Authoring shape of an effect (what mission files and presets write). */
export type SquadEffectInput = z.input<typeof SquadEffectSchema>;

// ── Objectives & fail conditions ──
export type Objective = z.infer<typeof ObjectiveSchema>;
export type ObjectiveOf<K extends ObjectiveType> = Extract<
  Objective,
  { type: K }
>;
export type FailCondition = z.infer<typeof FailConditionSchema>;

// ── Mission ──
export type RoadConfig = z.infer<typeof RoadConfigSchema>;
export type MissionArena = z.infer<typeof ArenaSchema>;
export type MissionRewards = z.infer<typeof MissionRewardsSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type MissionInput = z.input<typeof MissionSchema>;

/**
 * Parsed-but-unrefined shape. Validation functions take this so the schema
 * (which calls them) doesn't depend on its own output type.
 */
export type MissionDraft = z.infer<typeof MissionBaseSchema>;
export type SquadDraft = MissionDraft["squads"][number];
