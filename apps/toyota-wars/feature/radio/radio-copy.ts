import type { FlowSnapshot } from "@/lib/mission-flow/mission-flow.types";
import type { MissionNotice, ObjectiveProgressSnapshot } from "@toyota/missions";
import type { RadioTransmission } from "@/lib/radio/radio.types";
import { SQUAD_DIRECTIVE, type SquadDirective } from "@/lib/squad/squad.types";
import { TUTORIAL_STEPS } from "@/feature/game/tutorial/tutorial-steps";

const DIRECTIVE_COPY: Record<SquadDirective, { title: string; body: string }> = {
  [SQUAD_DIRECTIVE.ADVANCE]: {
    title: "ADVANCING",
    body: "Squad moving to contact.",
  },
  [SQUAD_DIRECTIVE.HOLD]: {
    title: "HOLDING",
    body: "Squad holding position.",
  },
  [SQUAD_DIRECTIVE.FLANK]: {
    title: "FLANKING",
    body: "Squad working the flank.",
  },
  [SQUAD_DIRECTIVE.FIGHTING_RETREAT]: {
    title: "FIGHTING RETREAT",
    body: "Falling back while engaging.",
  },
  [SQUAD_DIRECTIVE.GENERAL_RETREAT]: {
    title: "WITHDRAWING",
    body: "Squad withdrawing from contact.",
  },
};

export function missionNoticeTransmission(
  round: number,
  notice: MissionNotice,
): RadioTransmission {
  return {
    id: `mission-notice-${round}-${notice.id}`,
    channel: "command",
    callsign: "COMMAND",
    title: notice.title,
    body: notice.detail,
    priority: "urgent",
  };
}

export function tutorialStepTransmission(
  round: number,
  stepIndex: number,
): RadioTransmission | null {
  const step = TUTORIAL_STEPS[stepIndex];
  if (!step) return null;

  return {
    id: `tutorial-${round}-${step.id}`,
    channel: "command",
    callsign: "INSTRUCTOR",
    title: step.title,
    body: step.detail,
    priority: "routine",
  };
}

export function flowStepTransmission(
  round: number,
  flow: FlowSnapshot,
): RadioTransmission | null {
  if (!flow.sequenceId || !flow.stepId || flow.phase === "gameplay") return null;

  const title = flow.title ?? (flow.qte ? "QUICK TIME EVENT" : "COMMAND");
  const qtePrompt = flow.qte?.spec.prompts.find(
    (prompt) => flow.qte?.state.prompts[prompt.id] === "active",
  );
  const body = flow.qte
    ? [qtePrompt?.text ?? flow.qte.spec.prompts[0]?.text, qtePrompt?.detail]
        .filter(Boolean)
        .join(" · ")
    : (flow.caption ?? "");
  if (!body) return null;

  return {
    id: `flow-${round}-${flow.sequenceId}-${flow.stepId}`,
    channel: "command",
    callsign: "COMMAND",
    title,
    body,
    priority: flow.phase === "qte" ? "urgent" : "routine",
  };
}

export function flowOutcomeTransmission(
  round: number,
  flow: FlowSnapshot,
  outcome: "success" | "failure" | "skipped",
): RadioTransmission {
  const title =
    outcome === "success"
      ? "ACTION COMPLETE"
      : outcome === "skipped"
        ? "ACTION ABORTED"
        : "ACTION FAILED";
  return {
    id: `flow-outcome-${round}-${flow.sequenceId}-${flow.stepId}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title,
    body:
      flow.qte?.spec.prompts[0]?.text ?? flow.title ?? "Order executed.",
    priority: outcome === "failure" ? "urgent" : "routine",
  };
}

export function objectiveTransmission(
  round: number,
  objective: ObjectiveProgressSnapshot,
): RadioTransmission {
  const complete = objective.status === "complete";
  return {
    id: `objective-${round}-${objective.id}-${objective.status}`,
    channel: complete ? "ally" : "command",
    callsign: complete ? "ALPHA-1" : "COMMAND",
    title: complete ? "OBJECTIVE SECURE" : "OBJECTIVE FAILED",
    body: objective.title,
    priority: complete ? "routine" : "urgent",
  };
}

export function directiveTransmission(
  round: number,
  directive: SquadDirective,
  stamp: number,
): RadioTransmission {
  const copy = DIRECTIVE_COPY[directive];
  return {
    id: `directive-${round}-${directive}-${stamp}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title: copy.title,
    body: copy.body,
    priority: "routine",
  };
}

export function allyDownTransmission(
  round: number,
  unitId: string,
): RadioTransmission {
  return {
    id: `ally-down-${round}-${unitId}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title: "ALLY DOWN",
    body: "Element lost. Requesting support.",
    priority: "urgent",
  };
}

export function enemyDownTransmission(
  round: number,
  unitId: string,
): RadioTransmission {
  return {
    id: `enemy-down-${round}-${unitId}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title: "HOSTILE DESTROYED",
    body: "Target neutralized.",
    priority: "routine",
  };
}

export function playerDownTransmission(round: number): RadioTransmission {
  return {
    id: `player-down-${round}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title: "LEADER DOWN",
    body: "Command, we have lost the leader.",
    priority: "urgent",
  };
}

export function hullCriticalTransmission(round: number): RadioTransmission {
  return {
    id: `hull-critical-${round}`,
    channel: "ally",
    callsign: "ALPHA-1",
    title: "HULL CRITICAL",
    body: "Armor failure imminent. Need cover.",
    priority: "urgent",
  };
}
