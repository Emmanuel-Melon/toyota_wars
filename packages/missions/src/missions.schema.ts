// packages/missions/src/missions.schema.ts
import { z } from "zod";
import {
  FAIL_TYPE,
  INITIAL_ORDER,
  OBJECTIVE_TYPE,
  SQUAD_EFFECT_TYPE,
  TEAM,
  TIME_OF_DAY,
  TRIGGER_TYPE,
} from "./missions.config";
import { noEffects, waveEffects } from "./missions.presets";
import { validateCatalog, validateMission } from "./missions.validation";

/**
 * Mission schema. Pure data + structure: no game or three.js imports, so the
 * same file can be used by the game now and by the Express API later
 * (move to src/feature/missions/ and add extendZodWithOpenApi(z) when it does).
 *
 * Cross-reference rules (unknown squad ids, bounds, winnability) live in
 * mission.validation.ts. Positions are world units relative to the arena centre.
 */

// ─────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────
export const Vec2Schema = z.object({ x: z.number(), z: z.number() });

export const MissionZoneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  position: Vec2Schema,
  radius: z.number().positive(),
  captureSeconds: z.number().positive().default(5),
});

export const PersonalitySchema = z.object({
  aggression: z.number().min(0).max(1),
  caution: z.number().min(0).max(1),
});

export const TeamSchema = z.enum([TEAM.ALLY, TEAM.ENEMY]);

export const TimeOfDaySchema = z.enum([
  TIME_OF_DAY.DAWN,
  TIME_OF_DAY.DAY,
  TIME_OF_DAY.DUSK,
  TIME_OF_DAY.NIGHT,
]);

/**
 * A unit template id from the game's registry. Kept as a plain string so this file stays
 * usable by the backend; the game verifies ids at startup with assertKnownTemplates().
 */
export const UnitTemplateSchema = z.string().min(1);

export const VehicleModelSchema = z.string().min(1);

export const InitialOrderSchema = z.enum([
  INITIAL_ORDER.ATTACK,
  INITIAL_ORDER.FOLLOW,
  INITIAL_ORDER.FLEE,
  INITIAL_ORDER.PATROL,
]);

export const SpawnLayoutSchema = z.enum(["generated", "authored"]);
export const SquadFormationSchema = z.enum(["column", "wedge", "line"]);
export const SquadFireModeSchema = z.enum(["normal", "scripted"]);

// ─────────────────────────────────────────────────────────────
// FORCES
// ─────────────────────────────────────────────────────────────
export const SpawnTriggerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TRIGGER_TYPE.START) }),
  z.object({
    type: z.literal(TRIGGER_TYPE.TIME),
    atSeconds: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal(TRIGGER_TYPE.SQUAD_DESTROYED),
    squadId: z.string(),
    delaySeconds: z.number().nonnegative().default(0),
  }),
]);

export const SquadUnitSchema = z.object({
  template: UnitTemplateSchema,
  model: VehicleModelSchema.optional(),
  personality: PersonalitySchema.optional(), // falls back to the squad personality
  isLeader: z.boolean().default(false),
});

/**
 * Things that happen when a squad spawns or is wiped out. Notice text may use
 * {wave}, {count} and {next} (see NOTICE_TOKEN). `finalDetail` replaces `detail`
 * when no enemy squad is left to spawn.
 */
export const SquadEffectSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(SQUAD_EFFECT_TYPE.RESTORE_HULL) }),
  z.object({
    type: z.literal(SQUAD_EFFECT_TYPE.NOTICE),
    title: z.string().min(1),
    detail: z.string().default(""),
    finalDetail: z.string().optional(),
  }),
]);

const SquadEffectListSchema = z.array(SquadEffectSchema);

export const SquadRouteSchema = z.array(Vec2Schema).min(2);

const SquadBaseSchema = z.object({
  id: z.string(),
  team: TeamSchema,
  units: z.array(SquadUnitSchema).min(1),
  /** Units are assigned to spawn points in order, cycling if there are fewer points. */
  spawnPoints: z.array(Vec2Schema).min(1),
  spawnLayout: SpawnLayoutSchema.default("generated"),
  formation: SquadFormationSchema.default("wedge"),
  spacing: z.number().min(6).max(40).default(8),
  holdFormation: z.boolean().default(false),
  fireMode: SquadFireModeSchema.default("normal"),
  trigger: SpawnTriggerSchema.default({ type: TRIGGER_TYPE.START }),
  personality: PersonalitySchema.default({ aggression: 0.5, caution: 0.5 }),
  initialOrder: InitialOrderSchema.default(INITIAL_ORDER.PATROL),
  route: SquadRouteSchema.optional(),
  routeRadius: z.number().positive().default(8),
  /**
   * Omitted: enemy squads get the classic wave effects, allies get none.
   * `[]`: explicitly nothing. Either way the parsed squad always has both lists,
   * so the engine never needs a fallback.
   */
  onSpawned: SquadEffectListSchema.optional(),
  onDestroyed: SquadEffectListSchema.optional(),
});

export const SquadSchema = SquadBaseSchema.transform((squad) => {
  const fallback = squad.team === TEAM.ENEMY ? waveEffects() : noEffects();
  return {
    ...squad,
    onSpawned:
      squad.onSpawned ?? SquadEffectListSchema.parse(fallback.onSpawned),
    onDestroyed:
      squad.onDestroyed ?? SquadEffectListSchema.parse(fallback.onDestroyed),
  };
});

// ─────────────────────────────────────────────────────────────
// OBJECTIVES (typed params, discriminated by `type`)
// ─────────────────────────────────────────────────────────────
const ObjectiveBase = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean().default(true),
  hidden: z.boolean().default(false),
});

const ZoneObjectiveParamsSchema = z.object({
  squadId: z.string(),
  zoneId: z.string(),
  stopDistance: z.number().positive().optional(),
});

const TimedZoneObjectiveParamsSchema = ZoneObjectiveParamsSchema.extend({
  seconds: z.number().positive(),
});

const ArriveObjectiveParamsSchema = z.object({
  squadId: z.string(),
  escortSquadIds: z.array(z.string()).default([]),
});

const DenyArrivalObjectiveParamsSchema = z.object({
  squadId: z.string(),
});

export const ObjectiveSchema = z.discriminatedUnion("type", [
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.DESTROY_COUNT),
    params: z.object({
      team: TeamSchema.default(TEAM.ENEMY),
      count: z.number().int().positive(),
    }),
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.DESTROY_SQUAD),
    params: z.object({
      squadId: z.string(),
      leaderOnly: z.boolean().default(false),
    }),
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.SURVIVE),
    params: z.object({ seconds: z.number().positive() }),
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.KEEP_ALIVE),
    params: z.object({
      squadId: z.string(),
      minAlive: z.number().int().positive(),
    }),
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.CAPTURE),
    params: ZoneObjectiveParamsSchema,
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.DEFEND),
    params: TimedZoneObjectiveParamsSchema,
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.REACH),
    params: ZoneObjectiveParamsSchema,
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.ESCORT),
    params: TimedZoneObjectiveParamsSchema,
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.ARRIVE),
    params: ArriveObjectiveParamsSchema,
  }),
  ObjectiveBase.extend({
    type: z.literal(OBJECTIVE_TYPE.DENY_ARRIVAL),
    params: DenyArrivalObjectiveParamsSchema,
  }),
]);

// ─────────────────────────────────────────────────────────────
// FAIL CONDITIONS
// ─────────────────────────────────────────────────────────────
export const FailConditionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(FAIL_TYPE.PLAYER_DESTROYED) }),
  z.object({
    type: z.literal(FAIL_TYPE.TIME_LIMIT),
    seconds: z.number().positive(),
  }),
]);

// ─────────────────────────────────────────────────────────────
// MISSION
// ─────────────────────────────────────────────────────────────
export const RoadConfigSchema = z.object({
  waypoints: z.array(Vec2Schema).min(2),
  width: z.number().positive().default(24),
});

export const StructureTypeSchema = z.enum([
  "building",
  "watchtower",
  "checkpoint",
  "base",
]);
export const StructureAnchorSchema = z.enum(["world", "spawn"]);

export const ArenaStructureSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  structure: StructureTypeSchema.default("building"),
  anchor: StructureAnchorSchema.default("world"),
  position: Vec2Schema,
  yaw: z.number().default(0),
  width: z.number().positive().default(12),
  depth: z.number().positive().default(10),
  height: z.number().positive().default(6),
});

export const ArenaSchema = z.object({
  levelId: z.string().optional(),
  seed: z.number().int(),
  size: z.number().positive(),
  obstacleDensity: z.number().min(0).max(1).default(0.3),
  playerSpawn: Vec2Schema,
  heading: z.number().optional(),
  roads: RoadConfigSchema.optional(),
  structures: z.array(ArenaStructureSchema).default([]),
});

export const MissionRewardsSchema = z.object({
  xp: z.number().int().nonnegative(),
  unlocks: z.array(z.string()).default([]),
});

/** Structure only. Use MissionSchema, which adds the cross-reference rules. */
export const MissionBaseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  schemaVersion: z.literal(2).default(2),
  order: z.number().int().nonnegative(),
  title: z.string(),
  briefing: z.string(),
  difficulty: z.number().int().min(1).max(5),
  timeOfDay: TimeOfDaySchema.default(TIME_OF_DAY.DAY),
  requires: z.array(z.string()).default([]),
  zones: z.array(MissionZoneSchema).default([]),
  arena: ArenaSchema,
  squads: z.array(SquadSchema).min(1),
  objectives: z.array(ObjectiveSchema).min(1),
  failConditions: z.array(FailConditionSchema).min(1),
  rewards: MissionRewardsSchema,
});

export const MissionSchema = MissionBaseSchema.superRefine((m, ctx) =>
  validateMission(m, ctx),
);

export const MissionCatalogSchema = z
  .array(MissionSchema)
  .superRefine((missions, ctx) => validateCatalog(missions, ctx));
