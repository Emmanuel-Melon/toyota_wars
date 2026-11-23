// lib/missions/engine/mission.result.ts
import type { Mission } from "@/lib/missions/definition/mission.types";
import type { MissionRun } from "./mission.run";

/**
 * Terminal transition. Latches pending objectives (constraints count as met
 * on a win), freezes the run, builds the result. No-op unless active.
 */
export function finishRun(
  run: MissionRun,
  mission: Mission,
  outcome: "success" | "failed",
): void {
  if (run.status !== "active") return;

  run.objectives = run.objectives.map((o) => {
    if (o.status !== "pending") return o;
    return {
      ...o,
      status:
        outcome === "success" && o.kind === "constraint"
          ? "complete"
          : "failed",
    };
  });

  run.status = outcome;
  run.pendingSpawns = [];
  run.notice = null;
  run.result = {
    missionId: mission.id,
    outcome,
    elapsedSeconds: Math.round(run.elapsed),
    objectives: run.objectives.map(({ id, title, required, status }) => ({
      id,
      title,
      required,
      status,
    })),
    xp: outcome === "success" ? mission.rewards.xp : 0,
    unlocks: outcome === "success" ? mission.rewards.unlocks : [],
  };
}
