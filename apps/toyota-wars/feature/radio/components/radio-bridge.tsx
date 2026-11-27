"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCombat } from "@/context/combat-context";
import { useMission } from "@/context/missions.context";
import { useMissionFlow } from "@/feature/mission-flow/mission-flow.context";
import { COMBAT_CONFIG } from "@toyota/combat";
import type { RadioTransmission } from "@/lib/radio/radio.types";
import { resetRadio, transmitRadio } from "@/lib/radio/radio.store";
import type { SquadDirective } from "@/lib/squad/squad.types";
import type { ObjectiveStatus } from "@toyota/missions";
import {
  allyDownTransmission,
  directiveTransmission,
  enemyDownTransmission,
  flowOutcomeTransmission,
  flowStepTransmission,
  hullCriticalTransmission,
  missionNoticeTransmission,
  objectiveTransmission,
  playerDownTransmission,
  tutorialStepTransmission,
} from "../radio-copy";

type Props = {
  active: boolean;
  round: number;
  tutorialActive: boolean;
  tutorialStep: number;
};

const ROUTINE_CHATTER_COOLDOWN_MS = 4000;
const HEALTH_RESET_FRACTION = 0.45;

export function RadioBridge({
  active,
  round,
  tutorialActive,
  tutorialStep,
}: Props) {
  const { notice, objectives } = useMission();
  const flow = useMissionFlow();
  const { allyDirective, events, health } = useCombat();

  const lastNoticeRef = useRef<string | null>(null);
  const lastTutorialRef = useRef<string | null>(null);
  const lastFlowStepRef = useRef<string | null>(null);
  const flowRoundRef = useRef(round);
  const flowOutcomesRef = useRef<
    Record<string, "success" | "failure" | "skipped">
  >({});
  const objectiveRoundRef = useRef(round);
  const objectiveStatusesRef = useRef<Record<string, ObjectiveStatus>>({});
  const directiveStateRef = useRef<{
    round: number;
    directive: SquadDirective;
  } | null>(null);
  const lowHealthRoundRef = useRef(round);
  const lowHealthRef = useRef(false);
  const lastRoutineChatterAtRef = useRef(0);

  const sendAllyChatter = useCallback((transmission: RadioTransmission) => {
    const now = Date.now();
    if (
      transmission.priority === "routine" &&
      now - lastRoutineChatterAtRef.current < ROUTINE_CHATTER_COOLDOWN_MS
    )
      return;

    lastRoutineChatterAtRef.current = now;
    transmitRadio(transmission);
  }, []);

  useEffect(() => {
    lastNoticeRef.current = null;
    lastTutorialRef.current = null;
    lastFlowStepRef.current = null;
    flowRoundRef.current = round;
    flowOutcomesRef.current = {};
    objectiveRoundRef.current = round;
    objectiveStatusesRef.current = {};
    directiveStateRef.current = null;
    lowHealthRoundRef.current = round;
    lowHealthRef.current = false;
    resetRadio();
  }, [round]);

  useEffect(() => {
    if (!active) return;
    if (!notice) return;

    const key = `${round}:${notice.id}`;
    if (lastNoticeRef.current === key) return;

    lastNoticeRef.current = key;
    transmitRadio(missionNoticeTransmission(round, notice));
  }, [active, notice, round]);

  useEffect(() => {
    if (!active) return;
    if (!tutorialActive) {
      lastTutorialRef.current = null;
      return;
    }

    const transmission = tutorialStepTransmission(round, tutorialStep);
    if (!transmission || lastTutorialRef.current === transmission.id) return;

    lastTutorialRef.current = transmission.id;
    transmitRadio(transmission);
  }, [active, round, tutorialActive, tutorialStep]);

  useEffect(() => {
    if (!active) return;
    if (flowRoundRef.current !== round) {
      flowRoundRef.current = round;
      flowOutcomesRef.current = {};
      lastFlowStepRef.current = null;
    }

    const key =
      flow.sequenceId && flow.stepId
        ? `${flow.sequenceId}:${flow.stepId}`
        : null;

    if (key && key !== lastFlowStepRef.current) {
      lastFlowStepRef.current = key;
      const transmission = flowStepTransmission(round, flow);
      if (transmission) transmitRadio(transmission);
    }

    const outcome = flow.qte?.outcome;
    if (!key || !outcome || flowOutcomesRef.current[key] === outcome) return;

    flowOutcomesRef.current[key] = outcome;
    sendAllyChatter(flowOutcomeTransmission(round, flow, outcome));
  }, [active, flow, round, sendAllyChatter]);

  useEffect(() => {
    if (!active) return;
    if (objectiveRoundRef.current !== round) {
      objectiveRoundRef.current = round;
      objectiveStatusesRef.current = {};
    }

    for (const objective of objectives) {
      const previous = objectiveStatusesRef.current[objective.id];
      objectiveStatusesRef.current[objective.id] = objective.status;
      if (
        previous &&
        previous !== objective.status &&
        (objective.status === "complete" || objective.status === "failed")
      ) {
        sendAllyChatter(objectiveTransmission(round, objective));
      }
    }
  }, [active, objectives, round, sendAllyChatter]);

  useEffect(() => {
    if (!active) return;

    const state = directiveStateRef.current;
    if (!state || state.round !== round) {
      directiveStateRef.current = { round, directive: allyDirective };
      return;
    }
    if (state.directive === allyDirective) return;

    directiveStateRef.current = { round, directive: allyDirective };
    sendAllyChatter(directiveTransmission(round, allyDirective, Date.now()));
  }, [active, allyDirective, round, sendAllyChatter]);

  useEffect(() => {
    if (!active) return;

    const unsubscribe = [
      events.on("unitDestroyed", ({ unitId, killerTeam, victimTeam }) => {
        if (victimTeam === "ally") {
          sendAllyChatter(allyDownTransmission(round, unitId));
        } else if (victimTeam === "enemy" && killerTeam === "ally") {
          sendAllyChatter(enemyDownTransmission(round, unitId));
        }
      }),
      events.on("playerDestroyed", () => {
        sendAllyChatter(playerDownTransmission(round));
      }),
    ];

    return () => {
      for (const off of unsubscribe) off();
    };
  }, [active, events, round, sendAllyChatter]);

  useEffect(() => {
    if (!active) return;
    if (lowHealthRoundRef.current !== round) {
      lowHealthRoundRef.current = round;
      lowHealthRef.current = false;
    }

    const healthValue =
      health[COMBAT_CONFIG.PLAYER_ID] ?? COMBAT_CONFIG.PLAYER_MAX_HEALTH;
    const ratio = healthValue / COMBAT_CONFIG.PLAYER_MAX_HEALTH;

    if (
      ratio <= COMBAT_CONFIG.PLAYER_DANGER_HEALTH_FRACTION &&
      !lowHealthRef.current
    ) {
      lowHealthRef.current = true;
      sendAllyChatter(hullCriticalTransmission(round));
    } else if (ratio >= HEALTH_RESET_FRACTION) {
      lowHealthRef.current = false;
    }
  }, [active, health, round, sendAllyChatter]);

  return null;
}
