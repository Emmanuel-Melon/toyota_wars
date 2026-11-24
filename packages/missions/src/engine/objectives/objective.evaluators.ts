import { OBJECTIVE_KIND, OBJECTIVE_TYPE, TEAM } from "../../missions.config";
import type { Objective } from "../../missions.types";
import {
  type ObjectiveContext,
  type ObjectiveEvaluator,
  type ObjectiveEvaluatorRegistry,
} from "./objective.types";

type ZoneObjective = Extract<
  Objective,
  { params: { squadId: string; zoneId: string } }
>;

type TimedZoneObjective = Extract<
  Objective,
  { params: { squadId: string; zoneId: string; seconds: number } }
>;

type ArrivalObjective = Extract<
  Objective,
  { type: typeof OBJECTIVE_TYPE.ARRIVE }
>;

type DenyArrivalObjective = Extract<
  Objective,
  { type: typeof OBJECTIVE_TYPE.DENY_ARRIVAL }
>;

const ratio = (current: number, target: number): number =>
  target > 0 ? Math.min(1, Math.max(0, current / target)) : 0;

const insideZone = (
  objective: { params: { squadId: string; zoneId: string } },
  ctx: ObjectiveContext,
): boolean => {
  const zone = ctx.zone(objective.params.zoneId);
  if (!zone) return false;
  return ctx.positions(objective.params.squadId).some((p) => {
    const dx = p.x - zone.position.x;
    const dz = p.z - zone.position.z;
    return Math.hypot(dx, dz) <= zone.radius;
  });
};

const controlledByAlly = (objective: ZoneObjective, ctx: ObjectiveContext) => {
  const state = ctx.zoneState(objective.params.zoneId);
  return (
    state?.controllingTeam === TEAM.ALLY &&
    state.captureProgress >= 1 &&
    !state.contested
  );
};

const allyCaptureProgress = (
  objective: ZoneObjective,
  ctx: ObjectiveContext,
): number => {
  const state = ctx.zoneState(objective.params.zoneId);
  if (!state) return 0;
  if (controlledByAlly(objective, ctx)) return 1;
  return state.capturingTeam === TEAM.ALLY ? state.captureProgress : 0;
};

const holdEvaluator: Omit<ObjectiveEvaluator<TimedZoneObjective>, "kind"> = {
  isHolding: insideZone,
  evaluate: (o, ctx) => {
    const { seconds } = o.params;
    const held = Math.min(ctx.holdSeconds(o.id), seconds);
    return {
      status: held >= seconds ? "complete" : "pending",
      current: Math.floor(held),
      target: seconds,
      progress: ratio(held, seconds),
    };
  },
};

const zoneHoldEvaluator: Omit<
  ObjectiveEvaluator<TimedZoneObjective>,
  "kind"
> = {
  isHolding: controlledByAlly,
  evaluate: (o, ctx) => {
    const { seconds } = o.params;
    const held = Math.min(ctx.holdSeconds(o.id), seconds);
    return {
      status: held >= seconds ? "complete" : "pending",
      current: Math.floor(held),
      target: seconds,
      progress: ratio(held, seconds),
    };
  },
};

export const OBJECTIVE_EVALUATORS: ObjectiveEvaluatorRegistry = {
  [OBJECTIVE_TYPE.DESTROY_COUNT]: {
    kind: OBJECTIVE_KIND.destroyCount,
    evaluate: (o, ctx) => {
      const { team, count } = o.params;
      const current = Math.min(ctx.kills[team], count);
      return {
        status: current >= count ? "complete" : "pending",
        current,
        target: count,
        progress: ratio(current, count),
      };
    },
  },

  [OBJECTIVE_TYPE.DESTROY_SQUAD]: {
    kind: OBJECTIVE_KIND.destroySquad,
    evaluate: (o, ctx) => {
      const squad = ctx.squad(o.params.squadId);
      if (!squad || !squad.spawned)
        return { status: "pending", current: 0, target: 1, progress: 0 };

      if (o.params.leaderOnly) {
        const target = Math.max(1, squad.leadersTotal);
        const current = squad.leadersTotal - squad.leadersAlive;
        const done = squad.leadersTotal > 0 && squad.leadersAlive === 0;
        return {
          status: done ? "complete" : "pending",
          current,
          target,
          progress: done ? 1 : ratio(current, target),
        };
      }
      const current = squad.total - squad.alive;
      return {
        status: squad.alive === 0 ? "complete" : "pending",
        current,
        target: squad.total,
        progress: ratio(current, squad.total),
      };
    },
  },

  [OBJECTIVE_TYPE.SURVIVE]: {
    kind: OBJECTIVE_KIND.survive,
    evaluate: (o, ctx) => {
      const { seconds } = o.params;
      return {
        status: ctx.elapsed >= seconds ? "complete" : "pending",
        current: Math.floor(Math.min(ctx.elapsed, seconds)),
        target: seconds,
        progress: ratio(ctx.elapsed, seconds),
      };
    },
  },

  [OBJECTIVE_TYPE.KEEP_ALIVE]: {
    kind: OBJECTIVE_KIND.keepAlive,
    evaluate: (o, ctx) => {
      const { squadId, minAlive } = o.params;
      const squad = ctx.squad(squadId);
      if (!squad || !squad.spawned)
        return { status: "pending", current: 0, target: minAlive, progress: 0 };
      return {
        status: squad.alive < minAlive ? "failed" : "pending",
        current: squad.alive,
        target: minAlive,
        progress: ratio(squad.alive, minAlive),
      };
    },
  },

  [OBJECTIVE_TYPE.CAPTURE]: {
    kind: OBJECTIVE_KIND.capture,
    evaluate: (o, ctx) => {
      const progress = allyCaptureProgress(o, ctx);
      const complete = controlledByAlly(o, ctx);
      return {
        status: complete ? "complete" : "pending",
        current: complete ? 1 : 0,
        target: 1,
        progress: complete ? 1 : progress,
      };
    },
  },

  [OBJECTIVE_TYPE.REACH]: {
    kind: OBJECTIVE_KIND.reach,
    evaluate: (o, ctx) => {
      const current = insideZone(o, ctx) ? 1 : 0;
      return {
        status: current > 0 ? "complete" : "pending",
        current,
        target: 1,
        progress: current,
      };
    },
  },

  [OBJECTIVE_TYPE.DEFEND]: {
    kind: OBJECTIVE_KIND.defend,
    ...zoneHoldEvaluator,
  },

  [OBJECTIVE_TYPE.ESCORT]: {
    kind: OBJECTIVE_KIND.escort,
    ...holdEvaluator,
  },

  [OBJECTIVE_TYPE.ARRIVE]: {
    kind: OBJECTIVE_KIND.arrive,
    evaluate: (o: ArrivalObjective, ctx) => {
      const route = ctx.route(o.params.squadId);
      const arrived = route?.arrivedAt != null;
      const current = route
        ? Math.min(route.waypointIndex + (arrived ? 1 : 0), route.waypointCount)
        : 0;
      const target = route?.waypointCount ?? 1;
      return {
        status: arrived ? "complete" : "pending",
        current,
        target,
        progress: ratio(current, target),
      };
    },
  },

  [OBJECTIVE_TYPE.DENY_ARRIVAL]: {
    kind: OBJECTIVE_KIND.denyArrival,
    evaluate: (o: DenyArrivalObjective, ctx) => {
      const route = ctx.route(o.params.squadId);
      const arrived = route?.arrivedAt != null;
      return {
        status: arrived ? "failed" : "pending",
        current: arrived ? 1 : 0,
        target: 1,
        progress: arrived ? 1 : 0,
      };
    },
  },
};
