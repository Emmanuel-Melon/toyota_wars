// qte/qte.machine.ts
import type { FlowEffect } from "../flow.effects";
import type {
  PromptStatus, QteEvent, QteOutcome, QteSpec, QteState, QteTransition,
} from "./qte.types";

const isOpen = (s: PromptStatus) => s === "pending" || s === "active";

export function createQteMachine(spec: QteSpec) {
  const initial = (): QteState => ({
    status: "idle",
    outcome: null,
    elapsedMs: 0,
    prompts: Object.fromEntries(spec.prompts.map((p) => [p.id, "pending" as PromptStatus])),
    pressed: {},
  });

  function finish(state: QteState, effects: FlowEffect[]): QteTransition {
    const prompts = { ...state.prompts };
    for (const p of spec.prompts) {
      if (isOpen(prompts[p.id])) {
        prompts[p.id] = "missed";
        effects.push(...(p.onMiss ?? []));
      }
    }
    const failed = spec.prompts.some((p) => (p.required ?? true) && prompts[p.id] !== "hit");
    const outcome: QteOutcome = failed ? "failed" : "succeeded";
    const outcomeEffects = (outcome === "succeeded" ? spec.on?.succeed : spec.on?.fail) ?? [];
    return {
      state: { ...state, prompts, status: "finished", outcome },
      effects: [...effects, ...outcomeEffects, ...(spec.on?.finish ?? [])],
    };
  }

  function settle(state: QteState, effects: FlowEffect[], abort: boolean): QteTransition {
    const open = spec.prompts.some((p) => isOpen(state.prompts[p.id]));
    if (abort || !open || state.elapsedMs >= spec.durationMs) return finish(state, effects);
    return { state, effects };
  }

  function reduce(state: QteState, event: QteEvent): QteTransition {
    if (state.status === "finished" || state.status === "skipped") return { state, effects: [] };
    const effects: FlowEffect[] = [];

    switch (event.type) {
      case "start": {
        if (state.status !== "idle") return { state, effects };
        return { state: { ...state, status: "started" }, effects: [...(spec.on?.start ?? [])] };
      }

      case "skip": {
        if (!spec.skippable || state.status === "idle") return { state, effects };
        return {
          state: { ...state, status: "skipped", outcome: "skipped" },
          effects: [...(spec.on?.skip ?? []), ...(spec.on?.finish ?? [])],
        };
      }

      case "tick": {
        if (state.status === "idle") return { state, effects };
        const elapsedMs = state.elapsedMs + event.deltaMs;
        const prompts = { ...state.prompts };
        let abort = false;
        for (const p of spec.prompts) {
          if (prompts[p.id] === "pending" && elapsedMs >= p.startMs) prompts[p.id] = "active";
          if (prompts[p.id] === "active" && elapsedMs > p.endMs) {
            prompts[p.id] = "missed";
            effects.push(...(p.onMiss ?? []));
            if (p.failFast) abort = true;
          }
        }
        return settle({ ...state, status: "in-progress", elapsedMs, prompts }, effects, abort);
      }

      case "input": {
        if (state.status === "idle") return { state, effects };
        const key = event.key.toLowerCase();
        const prompts = { ...state.prompts };
        const pressed = { ...state.pressed };
        for (const p of spec.prompts) {
          if (prompts[p.id] !== "active") continue;
          const input = p.inputs.find((i) => i.keys.includes(key));
          if (!input) continue;
          const done = new Set(pressed[p.id] ?? []);
          done.add(input.id);
          pressed[p.id] = [...done];
          effects.push(...(input.effects ?? []));
          if (p.resolve === "any" || done.size === p.inputs.length) {
            prompts[p.id] = "hit";
            effects.push(...(p.onHit ?? []));
          }
        }
        return settle({ ...state, prompts, pressed }, effects, false);
      }
    }
  }

  return { initial, reduce };
}