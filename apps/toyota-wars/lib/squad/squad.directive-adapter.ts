import type { Vec2 } from "@/lib/missions/definition/mission.types";
import type {
  DirectiveTargetView,
  SquadDirectiveView,
} from "@/lib/missions/direction/mission-view.types";
import { SQUAD_DIRECTIVE, type SquadDirective } from "./squad.types";

export interface MissionStrategicInput {
  readonly directive: SquadDirective | null;
  readonly objectiveTarget: Vec2 | null;
  readonly targetStopDistance?: number;
  readonly targetIsObjective?: boolean;
}

const NO_ASSIGNMENT: MissionStrategicInput = Object.freeze({
  directive: null,
  objectiveTarget: null,
});

function insideZone(center: Vec2, target: DirectiveTargetView): boolean {
  if (!target.point || !target.radius || target.radius <= 0) return false;
  const dx = center.x - target.point.x;
  const dz = center.z - target.point.z;
  return dx * dx + dz * dz <= target.radius * target.radius;
}

function advanceToTarget(target: DirectiveTargetView): MissionStrategicInput {
  if (!target.point) return NO_ASSIGNMENT;
  return Object.freeze({
    directive: SQUAD_DIRECTIVE.ADVANCE,
    objectiveTarget: target.point,
    ...(target.stopDistance === undefined
      ? {}
      : { targetStopDistance: target.stopDistance }),
    targetIsObjective: true,
  });
}

function holdAtTarget(): MissionStrategicInput {
  return Object.freeze({
    directive: SQUAD_DIRECTIVE.HOLD,
    objectiveTarget: null,
  });
}

export function adaptDirectiveView(
  view: SquadDirectiveView | null | undefined,
  squadCenter: Vec2,
): MissionStrategicInput {
  if (!view) return NO_ASSIGNMENT;

  const { directive, target } = view;
  if (directive === "engage") {
    return Object.freeze({
      directive: SQUAD_DIRECTIVE.ADVANCE,
      objectiveTarget: null,
      targetIsObjective: false,
    });
  }

  if (target.kind === "none" || !target.point) return NO_ASSIGNMENT;

  if (
    directive === "hold" ||
    directive === "defend" ||
    directive === "escort"
  ) {
    return insideZone(squadCenter, target)
      ? holdAtTarget()
      : advanceToTarget(target);
  }

  return advanceToTarget(target);
}
