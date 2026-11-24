// apps/toyota-wars/lib/missions/definition/mission.validation.ts
import {
  NOTICE_TOKEN,
  OBJECTIVE_KIND,
  OBJECTIVE_TYPE,
  SQUAD_EFFECT_TYPE,
  TEAM,
  TRIGGER_TYPE,
} from "./mission.constants";
import type { Mission, MissionDraft, SquadDraft, Vec2 } from "./mission.types";

/**
 * Cross-reference and gameplay rules that a plain schema can't express.
 * Each rule group is its own function; validateMission just runs them in order.
 * (Phase 5 adds validateOrders here when squads get plans.)
 */

type IssuePath = (string | number)[];
type ReportIssue = (message: string, path: IssuePath) => void;

/** The subset of zod's refinement context these rules need. */
export interface IssueSink {
  addIssue(issue: { code: "custom"; message: string; path: IssuePath }): void;
}

const reporter =
  (sink: IssueSink): ReportIssue =>
  (message, path) =>
    sink.addIssue({ code: "custom", message, path });

const arenaHalf = (m: MissionDraft) => m.arena.size / 2;
const isOutside = (p: Vec2, half: number) =>
  Math.abs(p.x) > half || Math.abs(p.z) > half;
const MIN_SPAWN_SEPARATION = 30;
const MIN_OPPOSING_CENTROID_DISTANCE = 0.6;

// ─────────────────────────────────────────────────────────────
// MISSION
// ─────────────────────────────────────────────────────────────
export function validateMission(m: MissionDraft, sink: IssueSink): void {
  const report = reporter(sink);
  validateBounds(m, report);
  validateSpawnLayout(m, report);
  const zoneById = validateZones(m, report);
  const squadById = validateSquads(m, report);
  validateSquadEffects(m, report);
  validateObjectives(m, squadById, zoneById, report);
  validateWinnable(m, report);
}

/** Everything placed in the arena must be inside it. */
function validateBounds(m: MissionDraft, report: ReportIssue): void {
  const half = arenaHalf(m);

  if (isOutside(m.arena.playerSpawn, half)) {
    report(`playerSpawn is outside arena bounds (±${half})`, [
      "arena",
      "playerSpawn",
    ]);
  }
  m.squads.forEach((s, i) => {
    s.spawnPoints.forEach((point, j) => {
      if (isOutside(point, half))
        report(`spawnPoint is outside arena bounds (±${half})`, [
          "squads",
          i,
          "spawnPoints",
          j,
        ]);
    });
    s.route?.forEach((point, j) => {
      if (isOutside(point, half))
        report(`route waypoint is outside arena bounds (±${half})`, [
          "squads",
          i,
          "route",
          j,
        ]);
    });
  });
  const roadHalfWidth = (m.arena.roads?.width ?? 0) / 2;
  const roadLimit = half - roadHalfWidth;
  m.arena.roads?.waypoints.forEach((point, i) => {
    if (isOutside(point, roadLimit))
      report(
        `road waypoint plus road width is outside arena bounds (±${roadLimit})`,
        ["arena", "roads", "waypoints", i],
      );
  });
}

function validateSpawnLayout(m: MissionDraft, report: ReportIssue): void {
  const spawns: { point: Vec2; path: IssuePath }[] = [
    { point: m.arena.playerSpawn, path: ["arena", "playerSpawn"] },
    ...m.squads.flatMap((squad, squadIndex) =>
      squad.spawnPoints.map((point, pointIndex) => ({
        point,
        path: ["squads", squadIndex, "spawnPoints", pointIndex] as IssuePath,
      })),
    ),
  ];

  for (let i = 0; i < spawns.length; i += 1) {
    for (let j = i + 1; j < spawns.length; j += 1) {
      if (
        Math.hypot(
          spawns[i].point.x - spawns[j].point.x,
          spawns[i].point.z - spawns[j].point.z,
        ) < MIN_SPAWN_SEPARATION
      ) {
        report(
          `${spawns[i].path.join(".")} and ${spawns[j].path.join(".")} are closer than ${MIN_SPAWN_SEPARATION}m`,
          spawns[j].path,
        );
      }
    }
  }

  const friendly = [
    m.arena.playerSpawn,
    ...m.squads
      .filter((squad) => squad.team === TEAM.ALLY)
      .flatMap((squad) => squad.spawnPoints),
  ];
  const enemy = m.squads
    .filter((squad) => squad.team === TEAM.ENEMY)
    .flatMap((squad) => squad.spawnPoints);
  if (friendly.length === 0 || enemy.length === 0) return;

  const centroid = (points: readonly Vec2[]): Vec2 => ({
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    z: points.reduce((sum, point) => sum + point.z, 0) / points.length,
  });
  const friendlyCenter = centroid(friendly);
  const enemyCenter = centroid(enemy);
  const dx = enemyCenter.x - friendlyCenter.x;
  const dz = enemyCenter.z - friendlyCenter.z;

  if (Math.hypot(dx, dz) < m.arena.size * MIN_OPPOSING_CENTROID_DISTANCE) {
    report("opposing spawn centroids are too close together", ["squads"]);
  }

  const axis = Math.abs(dx) >= Math.abs(dz) ? "x" : "z";
  if (friendlyCenter[axis] * enemyCenter[axis] >= 0) {
    report(
      `opposing spawns must be on opposite sides of the arena on ${axis}`,
      ["squads"],
    );
  }
}

function validateZones(
  m: MissionDraft,
  report: ReportIssue,
): Map<string, MissionDraft["zones"][number]> {
  const half = arenaHalf(m);
  const zoneById = new Map<string, MissionDraft["zones"][number]>();

  m.zones.forEach((zone, i) => {
    if (zoneById.has(zone.id))
      report(`Duplicate zone id "${zone.id}"`, ["zones", i, "id"]);
    zoneById.set(zone.id, zone);
    if (isOutside(zone.position, half))
      report(`zone position is outside arena bounds (±${half})`, [
        "zones",
        i,
        "position",
      ]);
    if (
      Math.abs(zone.position.x) + zone.radius > half ||
      Math.abs(zone.position.z) + zone.radius > half
    )
      report(`zone extends outside arena bounds (±${half})`, [
        "zones",
        i,
        "radius",
      ]);
  });

  return zoneById;
}

/** Unique ids, at most one leader, valid spawn triggers. Returns the id index for later rules. */
function validateSquads(
  m: MissionDraft,
  report: ReportIssue,
): Map<string, SquadDraft> {
  const squadById = new Map<string, SquadDraft>();

  m.squads.forEach((s, i) => {
    if (squadById.has(s.id))
      report(`Duplicate squad id "${s.id}"`, ["squads", i, "id"]);
    squadById.set(s.id, s);

    if (s.units.filter((u) => u.isLeader).length > 1) {
      report(`Squad "${s.id}" has more than one leader`, [
        "squads",
        i,
        "units",
      ]);
    }
    if (
      s.trigger.type === TRIGGER_TYPE.SQUAD_DESTROYED &&
      s.trigger.squadId === s.id
    ) {
      report(`Squad "${s.id}" cannot be triggered by itself`, [
        "squads",
        i,
        "trigger",
      ]);
    }
  });

  // Second pass: needs the complete id index.
  m.squads.forEach((s, i) => {
    if (
      s.trigger.type === TRIGGER_TYPE.SQUAD_DESTROYED &&
      !squadById.has(s.trigger.squadId)
    ) {
      report(`Trigger references unknown squad "${s.trigger.squadId}"`, [
        "squads",
        i,
        "trigger",
      ]);
    }
  });

  return squadById;
}

/** Notice text may only use known {tokens}, so a typo fails at load instead of showing "{wvae}". */
function validateSquadEffects(m: MissionDraft, report: ReportIssue): void {
  const known = new Set<string>(Object.values(NOTICE_TOKEN));
  const phases = ["onSpawned", "onDestroyed"] as const;
  const fields = ["title", "detail", "finalDetail"] as const;

  m.squads.forEach((squad, i) => {
    for (const phase of phases) {
      squad[phase].forEach((effect, j) => {
        if (effect.type !== SQUAD_EFFECT_TYPE.NOTICE) return;
        for (const field of fields) {
          const text = effect[field];
          if (!text) continue;
          for (const match of text.matchAll(/\{(\w+)\}/g)) {
            if (!known.has(match[1]))
              report(`Unknown notice token "{${match[1]}}"`, [
                "squads",
                i,
                phase,
                j,
                field,
              ]);
          }
        }
      });
    }
  });
}

/** Objective ids, squad references, team constraints and zone bounds. */
function validateObjectives(
  m: MissionDraft,
  squadById: ReadonlyMap<string, SquadDraft>,
  zoneById: ReadonlyMap<string, MissionDraft["zones"][number]>,
  report: ReportIssue,
): void {
  const objectiveIds = new Set<string>();

  m.objectives.forEach((o, i) => {
    if (objectiveIds.has(o.id))
      report(`Duplicate objective id "${o.id}"`, ["objectives", i, "id"]);
    objectiveIds.add(o.id);

    if (
      o.type === OBJECTIVE_TYPE.DESTROY_SQUAD ||
      o.type === OBJECTIVE_TYPE.KEEP_ALIVE
    ) {
      const squad = squadById.get(o.params.squadId);
      if (!squad)
        return report(`Unknown squad "${o.params.squadId}"`, [
          "objectives",
          i,
          "params",
        ]);
      if (
        o.type === OBJECTIVE_TYPE.DESTROY_SQUAD &&
        squad.team !== TEAM.ENEMY
      ) {
        report(`destroySquad must target an enemy squad`, [
          "objectives",
          i,
          "params",
          "squadId",
        ]);
      }
      if (o.type === OBJECTIVE_TYPE.KEEP_ALIVE) {
        if (squad.team !== TEAM.ALLY)
          report(`keepAlive must target an ally squad`, [
            "objectives",
            i,
            "params",
            "squadId",
          ]);
        if (o.params.minAlive > squad.units.length) {
          report(`minAlive exceeds squad size`, [
            "objectives",
            i,
            "params",
            "minAlive",
          ]);
        }
      }
      if (
        o.type === OBJECTIVE_TYPE.DESTROY_SQUAD &&
        o.params.leaderOnly &&
        !squad.units.some((u) => u.isLeader)
      ) {
        report(`leaderOnly objective but squad has no leader`, [
          "objectives",
          i,
          "params",
          "leaderOnly",
        ]);
      }
    }

    if (
      o.type === OBJECTIVE_TYPE.CAPTURE ||
      o.type === OBJECTIVE_TYPE.DEFEND ||
      o.type === OBJECTIVE_TYPE.REACH ||
      o.type === OBJECTIVE_TYPE.ESCORT
    ) {
      if (!squadById.has(o.params.squadId))
        report(`Unknown squad "${o.params.squadId}"`, [
          "objectives",
          i,
          "params",
          "squadId",
        ]);

      const zone = zoneById.get(o.params.zoneId);
      if (!zone) {
        report(`Unknown zone "${o.params.zoneId}"`, [
          "objectives",
          i,
          "params",
          "zoneId",
        ]);
      } else if (
        o.params.stopDistance !== undefined &&
        o.params.stopDistance > zone.radius
      ) {
        report(`stopDistance exceeds zone radius`, [
          "objectives",
          i,
          "params",
          "stopDistance",
        ]);
      }
    }

    if (
      o.type === OBJECTIVE_TYPE.ARRIVE ||
      o.type === OBJECTIVE_TYPE.DENY_ARRIVAL
    ) {
      const squad = squadById.get(o.params.squadId);
      if (!squad) {
        report(`Unknown squad "${o.params.squadId}"`, [
          "objectives",
          i,
          "params",
          "squadId",
        ]);
      } else {
        if (!squad.route)
          report(`Squad "${squad.id}" needs a route for ${o.type}`, [
            "objectives",
            i,
            "params",
            "squadId",
          ]);
        if (o.type === OBJECTIVE_TYPE.ARRIVE && squad.team !== TEAM.ALLY) {
          report(`arrive must target an ally squad`, [
            "objectives",
            i,
            "params",
            "squadId",
          ]);
        }
        if (
          o.type === OBJECTIVE_TYPE.DENY_ARRIVAL &&
          squad.team !== TEAM.ENEMY
        ) {
          report(`denyArrival must target an enemy squad`, [
            "objectives",
            i,
            "params",
            "squadId",
          ]);
        }
      }

      if (o.type === OBJECTIVE_TYPE.ARRIVE) {
        o.params.escortSquadIds.forEach((id, j) => {
          const escort = squadById.get(id);
          if (!escort) {
            report(`Unknown escort squad "${id}"`, [
              "objectives",
              i,
              "params",
              "escortSquadIds",
              j,
            ]);
            return;
          }
          if (escort.team !== TEAM.ALLY)
            report(`Escort squad "${id}" must be an ally`, [
              "objectives",
              i,
              "params",
              "escortSquadIds",
              j,
            ]);
        });
      }
    }
  });
}

/** The mission must be winnable and have something to fight. */
function validateWinnable(m: MissionDraft, report: ReportIssue): void {
  if (
    !m.objectives.some((o) => o.required && OBJECTIVE_KIND[o.type] === "goal")
  ) {
    report(
      "At least one required objective must be a goal (destroy/survive/capture/defend/reach/escort), or the mission can never be won",
      ["objectives"],
    );
  }
  if (!m.squads.some((s) => s.team === TEAM.ENEMY))
    report("Mission needs at least one enemy squad", ["squads"]);
}

// ─────────────────────────────────────────────────────────────
// CATALOG
// ─────────────────────────────────────────────────────────────
/** Unique mission ids; `requires` and `rewards.unlocks` must point at real missions. */
export function validateCatalog(
  missions: readonly Mission[],
  sink: IssueSink,
): void {
  const report = reporter(sink);
  const ids = new Set(missions.map((m) => m.id));
  const seen = new Set<string>();

  missions.forEach((m, i) => {
    if (seen.has(m.id)) report(`Duplicate mission id "${m.id}"`, [i, "id"]);
    seen.add(m.id);

    for (const ref of [...m.requires, ...m.rewards.unlocks]) {
      if (!ids.has(ref)) report(`Unknown mission "${ref}"`, [i]);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// GAME-SIDE CHECK
// ─────────────────────────────────────────────────────────────
/**
 * Call at game startup with the real template ids (from your unit registry).
 * Throws with every bad mission/squad/template so typos fail loudly instead of mid-mission.
 */
export function assertKnownTemplates(
  missions: readonly Mission[],
  known: Iterable<string>,
): void {
  const ids = new Set(known);
  const problems: string[] = [];
  for (const m of missions) {
    for (const s of m.squads) {
      for (const u of s.units) {
        if (!ids.has(u.template))
          problems.push(`${m.id}/${s.id}: unknown template "${u.template}"`);
      }
    }
  }
  if (problems.length > 0)
    throw new Error(`Unknown unit templates:\n${problems.join("\n")}`);
}

export function assertKnownVehicleModels(
  missions: readonly Mission[],
  known: Iterable<string>,
): void {
  const ids = new Set(known);
  const problems: string[] = [];
  for (const m of missions) {
    for (const s of m.squads) {
      for (const u of s.units) {
        if (u.model && !ids.has(u.model))
          problems.push(`${m.id}/${s.id}: unknown vehicle model "${u.model}"`);
      }
    }
  }
  if (problems.length > 0)
    throw new Error(`Unknown vehicle models:\n${problems.join("\n")}`);
}

export function assertSingleAllyRadar(
  missions: readonly Mission[],
  radarTemplateId: string,
  radarModelId: string,
): void {
  const problems: string[] = [];
  for (const mission of missions) {
    const radarUnits = mission.squads.flatMap((squad) =>
      squad.units
        .filter(
          (unit) =>
            unit.template === radarTemplateId || unit.model === radarModelId,
        )
        .map(() => squad),
    );
    if (radarUnits.length !== 1) {
      problems.push(
        `${mission.id}: expected exactly one radar unit, found ${radarUnits.length}`,
      );
      continue;
    }
    if (radarUnits[0].team !== TEAM.ALLY) {
      problems.push(
        `${mission.id}/${radarUnits[0].id}: radar unit must be on team ${TEAM.ALLY}`,
      );
    }
  }
  if (problems.length > 0)
    throw new Error(`Invalid radar units:\n${problems.join("\n")}`);
}
