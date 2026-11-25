// qte/useQteRunner.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlowEffect } from "@/lib/mission-flow/flow.effects";
import { createQteMachine } from "@/lib/mission-flow/qte/qte.machine";
import type { QteEvent, QteOutcome, QteSpec } from "@/lib/mission-flow/qte/qte.types";

export function useQteRunner(
  spec: QteSpec,
  runEffect: (e: FlowEffect) => void,
  onDone: (outcome: QteOutcome) => void,
) {
  const machine = useMemo(() => createQteMachine(spec), [spec]);
  const ref = useRef(machine.initial());
  const [state, setState] = useState(ref.current);

  const dispatch = useCallback((event: QteEvent) => {
    const prev = ref.current;
    const { state: next, effects } = machine.reduce(prev, event);
    if (next === prev) return;
    ref.current = next;
    setState(next);
    effects.forEach(runEffect);
    if (next.outcome && !prev.outcome) onDone(next.outcome);
  }, [machine, runEffect, onDone]);

  useEffect(() => {
    dispatch({ type: "start" });
    const onKey = (e: KeyboardEvent) =>
      dispatch(e.key === "Escape" ? { type: "skip" } : { type: "input", key: e.key });
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  return { state, dispatch };
}