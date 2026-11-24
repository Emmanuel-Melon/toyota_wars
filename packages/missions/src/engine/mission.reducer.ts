import { FAIL_TYPE } from "../missions.config";
import type { Mission, MissionZone, Objective } from "../missions.types";
import { OBJECTIVE_EVALUATORS } from "./objectives/objective.evaluators";
import type {
  ObjectiveContext,
  ObjectiveEvaluator,
} from "./objectives/objective.types";
import { squadEffects, type MissionEffect } from "./mission.effects";
import {
  alivePositions,
  quantizeProgress,
  updateRoutes,
  updateZones,
  type MissionRun,
} from "./mission.run";
import {
  initialPendingSpawns,
  pendingSpawnsOnSquadDestroyed,
  takeDueSpawns,
} from "./mission.triggers";
import { finishRun } from "./mission.result";

export type MissionEvent =
  | { type: "tick"; dt: number }
  | { type: "unitDestroyed"; unitId: string }
  | { type: "playerDestroyed" };

export interface Reduction {
  effects: MissionEffect[];
  changed: boolean;
}

const unchanged: Reduction = { effects: [], changed: false };

export function reduce(
  run: MissionRun,
  mission: Mission,
  event: MissionEvent,
): Reduction {
  switch (event.type) {
    case "tick":
      return tick(run, mission, event.dt);
    case "unitDestroyed":
      return onUnitDestroyed(run, mission, event.unitId);
    case "playerDestroyed":
      return onPlayerDestroyed(run, mission);
  }
}

export function beginMission(
  run: MissionRun,
  mission: Mission,
): MissionEffect[] {
  run.status = "active";
  run.pendingSpawns = initialPendingSpawns(mission);
  updateRoutes(run, mission);
  evaluateObjectives(run, mission);
  return takeDueSpawns(run, 0).map((squadId) => ({
    type: "spawnSquad",
    squadId,
  }));
}

function tick(run: MissionRun, mission: Mission, dt: number): Reduction {
  if (run.status !== "active") return unchanged;

  run.elapsed += dt;
  const effects: MissionEffect[] = takeDueSpawns(run, run.elapsed).map(
    (squadId) => ({ type: "spawnSquad", squadId }),
  );

  let changed = false;
  if (run.notice && run.elapsed >= run.notice.expiresAt) {
    run.notice = null;
    changed = true;
  }
  if (updateZones(run, mission, dt)) changed = true;
  if (updateRoutes(run, mission)) changed = true;
  if (evaluateObjectives(run, mission)) changed = true;

  const limit = mission.failConditions.find(
    (f) => f.type === FAIL_TYPE.TIME_LIMIT,
  );
  if (run.status === "active" && limit && run.elapsed >= limit.seconds) {
    finishRun(run, mission, "failed");
    changed = true;
  }

  return { effects, changed };
}

function onUnitDestroyed(
  run: MissionRun,
  mission: Mission,
  unitId: string,
): Reduction {
  if (run.status !== "active") return unchanged;
  const unit = run.units.get(unitId);
  if (!unit || !unit.alive) return unchanged;

  unit.alive = false;
  run.kills[unit.team] += 1;
  const effects: MissionEffect[] = [];

  const squad = run.squads.get(unit.squadId);
  if (squad) {
    squad.alive -= 1;
    if (unit.isLeader) squad.leadersAlive -= 1;

    if (squad.alive === 0) {
      const definition = mission.squads.find((s) => s.id === unit.squadId);
      if (definition)
        effects.push(...squadEffects(run, mission, definition, "destroyed"));

      for (const spawn of pendingSpawnsOnSquadDestroyed(
        mission,
        unit.squadId,
        run.elapsed,
      )) {
        run.pendingSpawns.push(spawn);
      }
      for (const squadId of takeDueSpawns(run, run.elapsed)) {
        effects.push({ type: "spawnSquad", squadId });
      }
    }
  }

  updateRoutes(run, mission);
  evaluateObjectives(run, mission);
  return { effects, changed: true };
}

function onPlayerDestroyed(run: MissionRun, mission: Mission): Reduction {
  if (run.status !== "active") return unchanged;
  if (
    !mission.failConditions.some((f) => f.type === FAIL_TYPE.PLAYER_DESTROYED)
  )
    return unchanged;
  finishRun(run, mission, "failed");
  return { effects: [], changed: true };
}

function evaluatorFor(o: Objective) {
  return OBJECTIVE_EVALUATORS[
    o.type
  ] as unknown as ObjectiveEvaluator<Objective>;
}

function evaluateObjectives(run: MissionRun, mission: Mission): boolean {
  const dt = Math.max(0, run.elapsed - run.lastEvaluatedElapsed);
  run.lastEvaluatedElapsed = run.elapsed;

  const zoneById = new Map<string, MissionZone>(
    mission.zones.map((zone) => [zone.id, zone]),
  );
  const ctx: ObjectiveContext = {
    elapsed: run.elapsed,
    kills: run.kills,
    squad: (id) => run.squads.get(id),
    positions: (squadId) => alivePositions(run, squadId),
    zone: (zoneId) => zoneById.get(zoneId),
    zoneState: (zoneId) => run.zoneStates.get(zoneId),
    route: (squadId) => run.routes.get(squadId),
    holdSeconds: (objectiveId) => run.objectiveHolds.get(objectiveId) ?? 0,
  };

  let changed = false;
  mission.objectives.forEach((o, i) => {
    const prev = run.objectives[i];
    if (prev.status !== "pending") return;
    const evaluator = evaluatorFor(o);
    if (evaluator.isHolding) {
      const seconds = evaluator.isHolding(o, ctx)
        ? (run.objectiveHolds.get(o.id) ?? 0) + dt
        : 0;
      run.objectiveHolds.set(o.id, seconds);
    }
    const next = evaluator.evaluate(o, ctx);
    if (
      next.status !== prev.status ||
      next.current !== prev.current ||
      next.target !== prev.target ||
      quantizeProgress(next.progress) !== prev.progress
    ) {
      run.objectives[i] = {
        ...prev,
        ...next,
        progress: quantizeProgress(next.progress),
      };
      changed = true;
    }
  });

  if (run.status === "active") {
    const required = run.objectives.filter((o) => o.required);
    if (required.some((o) => o.status === "failed")) {
      finishRun(run, mission, "failed");
      changed = true;
    } else {
      const goals = required.filter((o) => o.kind === "goal");
      if (goals.length > 0 && goals.every((o) => o.status === "complete")) {
        finishRun(run, mission, "success");
        changed = true;
      }
    }
  }
  return changed;
}
