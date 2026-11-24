"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMission } from "@/context/missions.context";
import { MissionFlowRunner } from "./mission-flow.store";
import { getMissionFlowScript } from "./scripts";
import type { FlowSnapshot } from "./mission-flow.types";

const MissionFlowContext = createContext<MissionFlowRunner | null>(null);

export function MissionFlowProvider({ children }: { children: ReactNode }) {
  const [runner] = useState(() => new MissionFlowRunner());

  useEffect(() => () => runner.reset(), [runner]);

  return (
    <MissionFlowContext.Provider value={runner}>
      <MissionFlowBridge runner={runner} />
      {children}
    </MissionFlowContext.Provider>
  );
}

function MissionFlowBridge({ runner }: { runner: MissionFlowRunner }) {
  const { mission, status } = useMission();
  const missionId = mission?.id ?? null;
  const startedMissionId = useRef<string | null>(missionId);

  useEffect(() => {
    if (!missionId) {
      startedMissionId.current = null;
      return;
    }

    if (status === "idle" || status === "briefing") {
      startedMissionId.current = null;
    }

    if (status !== "active" || startedMissionId.current === missionId) return;

    const script = getMissionFlowScript(missionId);
    if (!script) return;

    startedMissionId.current = missionId;
    runner.start(script);
  }, [missionId, runner, status]);

  useEffect(() => {
    if (status !== "success" && status !== "failed") return;
    if (runner.getSnapshot().phase !== "gameplay") runner.reset();
  }, [runner, status]);

  return null;
}

export function useMissionFlowRunner(): MissionFlowRunner {
  const runner = useContext(MissionFlowContext);
  if (!runner) {
    throw new Error(
      "useMissionFlowRunner must be used inside <MissionFlowProvider>",
    );
  }
  return runner;
}

export function useMissionFlow(): FlowSnapshot {
  const runner = useMissionFlowRunner();
  return useSyncExternalStore(
    runner.subscribe,
    runner.getSnapshot,
    runner.getSnapshot,
  );
}
