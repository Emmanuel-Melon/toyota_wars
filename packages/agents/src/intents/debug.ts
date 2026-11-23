import { clamp01, type ScoredRow } from "@toyota/ai";
import type { AgentIntentId } from "./types";

export interface AgentUtilityDebugSink {
  now(): number;
  table(rows: Array<{ intent: string; raw: number; score: number }>): void;
  debug(message: string): void;
}

export function createAgentUtilityDebug(
  label: string,
  sink: AgentUtilityDebugSink | undefined,
):
  | ((rows: ScoredRow<AgentIntentId>[], chosen: AgentIntentId) => void)
  | undefined {
  if (!sink) return undefined;

  let lastLog = 0;
  return (rows, chosen) => {
    const now = sink.now();
    if (now - lastLog < 1000) return;
    lastLog = now;
    sink.table(
      rows.map((row) => ({
        intent: row.id,
        raw: +clamp01(row.raw).toFixed(3),
        score: +row.score.toFixed(3),
      })),
    );
    sink.debug(`[utility] ${label} -> ${chosen}`);
  };
}
