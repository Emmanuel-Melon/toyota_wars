// qte/qte.types.ts
import type { FlowEffect } from "../flow.effects";

export interface QteInput {
  id: string;
  keys: string[];          // alternates, e.g. ["a", "d"]
  label: string;           // shown in the HUD
  effects?: FlowEffect[];  // run when this specific input is pressed
}

export interface QtePrompt {
  id: string;
  text: string;
  detail?: string;
  startMs: number;         // window relative to QTE start
  endMs: number;
  inputs: QteInput[];
  resolve: "any" | "all";  // any = one input hits it; all = every input must be pressed
  required?: boolean;      // default true; optional prompts are bonuses
  failFast?: boolean;      // a miss ends the QTE immediately as failed
  onHit?: FlowEffect[];
  onMiss?: FlowEffect[];
}

export interface QteLifecycle {
  start?: FlowEffect[];
  succeed?: FlowEffect[];
  fail?: FlowEffect[];
  skip?: FlowEffect[];
  finish?: FlowEffect[];   // runs on every terminal outcome
}

export interface QteSpec {
  durationMs: number;
  skippable?: boolean;
  prompts: QtePrompt[];
  on?: QteLifecycle;
}

export type QteStatus = "idle" | "started" | "in-progress" | "finished" | "skipped";
export type QteOutcome = "succeeded" | "failed" | "skipped";
export type PromptStatus = "pending" | "active" | "hit" | "missed";

export interface QteState {
  status: QteStatus;
  outcome: QteOutcome | null;
  elapsedMs: number;
  prompts: Record<string, PromptStatus>;
  pressed: Record<string, string[]>; // promptId -> input ids already pressed
}

export type QteEvent =
  | { type: "start" }
  | { type: "tick"; deltaMs: number }
  | { type: "input"; key: string }
  | { type: "skip" };

export interface QteTransition {
  state: QteState;
  effects: FlowEffect[]; // for the runner to execute
}