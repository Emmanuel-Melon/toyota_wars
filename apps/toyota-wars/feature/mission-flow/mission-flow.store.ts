import type {
  FlowCameraMode,
  FlowPhase,
  FlowQteSnapshot,
  FlowRuntime,
  FlowScript,
  FlowSnapshot,
  FlowStep,
  QteOutcome,
} from "@/lib/mission-flow/mission-flow.types";
import type { FlowEffect } from "@/lib/mission-flow/flow.effects";
import { createQteMachine } from "@/lib/mission-flow/qte/qte.machine";
import type {
  QteEvent,
  QteOutcome as MachineQteOutcome,
  QteState,
} from "@/lib/mission-flow/qte/qte.types";

const QTE_RESOLVE_HOLD_MS = 420;
const MAX_FRAME_MS = 100;

const FLOW_OUTCOME: Record<MachineQteOutcome, Exclude<QteOutcome, null>> = {
  succeeded: "success",
  failed: "failure",
  skipped: "skipped",
};

type LiveQte = {
  id: string;
  outcome: QteOutcome;
};

export class MissionFlowRunner {
  private script: FlowScript | null = null;
  private stepIndex = -1;
  private elapsedMs = 0;
  private qteResolvedMs = 0;
  private phase: FlowPhase = "gameplay";
  private sequenceId: string | null = null;
  private camera: FlowCameraMode = "player";
  private cameraEpoch = 0;
  private qte: LiveQte | null = null;
  private qteMachine: ReturnType<typeof createQteMachine> | null = null;
  private qteState: QteState | null = null;
  private outcomes: Record<string, QteOutcome> = {};
  private listeners = new Set<() => void>();
  private snapshot = this.createSnapshot();

  constructor(private onEffect?: (effect: FlowEffect) => void) {}

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  getRuntime(): FlowRuntime {
    const step = this.currentStep();
    return {
      phase: this.phase,
      sequenceId: this.sequenceId,
      stepId: step?.id ?? null,
      elapsedMs: this.elapsedMs,
      stepDurationMs: step?.durationMs ?? 0,
      camera: this.camera,
      cameraEpoch: this.cameraEpoch,
      qteOutcomes: this.outcomes,
    };
  }

  getCurrentStep(): FlowStep | null {
    return this.currentStep();
  }

  start(script: FlowScript) {
    if (this.phase !== "gameplay" || script.steps.length === 0) return;

    this.script = script;
    this.stepIndex = 0;
    this.sequenceId = script.id;
    this.outcomes = {};
    this.camera = "scripted";
    this.enterStep(script.steps[0]);
  }

  update(deltaMs: number) {
    if (!this.script || this.phase === "gameplay") return;

    const step = this.currentStep();
    if (!step) {
      this.finish();
      return;
    }

    const frameMs = Math.min(Math.max(deltaMs, 0), MAX_FRAME_MS);
    this.elapsedMs += frameMs;

    if (step.type === "qte") {
      if (this.qte?.outcome) {
        this.qteResolvedMs += frameMs;
        if (this.qteResolvedMs >= QTE_RESOLVE_HOLD_MS) this.advance();
        return;
      }

      this.dispatchQte({ type: "tick", deltaMs: frameMs });
      return;
    }

    if (this.elapsedMs >= step.durationMs) this.advance();
  }

  resolveQte(key: string) {
    if (this.phase !== "qte" || !this.qte || this.qte.outcome) return;
    this.dispatchQte({ type: "input", key });
  }

  skip() {
    if (this.phase === "gameplay") return;

    const step = this.currentStep();
    if (step?.type === "qte" && this.qte && !this.qte.outcome) {
      this.dispatchQte({ type: "skip" });
      if (!this.qte.outcome) this.setQteOutcome("failure");
    }
    this.finish();
  }

  reset() {
    this.script = null;
    this.stepIndex = -1;
    this.elapsedMs = 0;
    this.qteResolvedMs = 0;
    this.phase = "gameplay";
    this.sequenceId = null;
    this.camera = "player";
    this.cameraEpoch += 1;
    this.qte = null;
    this.qteMachine = null;
    this.qteState = null;
    this.outcomes = {};
    this.emit();
  }

  private advance() {
    if (!this.script) return;

    const next = this.script.steps[this.stepIndex + 1];
    if (!next) {
      this.finish();
      return;
    }

    this.stepIndex += 1;
    this.enterStep(next);
  }

  private enterStep(step: FlowStep) {
    this.elapsedMs = 0;
    this.qteResolvedMs = 0;
    this.phase = step.type;
    if (step.type === "qte") {
      this.qte = { id: step.id, outcome: null };
      this.qteMachine = createQteMachine(step.qte);
      this.qteState = this.qteMachine.initial();
      this.dispatchQte({ type: "start" });
    } else {
      this.qte = null;
      this.qteMachine = null;
      this.qteState = null;
    }
    this.emit();
  }

  private finish() {
    this.script = null;
    this.stepIndex = -1;
    this.elapsedMs = 0;
    this.qteResolvedMs = 0;
    this.phase = "gameplay";
    this.sequenceId = null;
    this.camera = "player";
    this.cameraEpoch += 1;
    this.qte = null;
    this.qteMachine = null;
    this.qteState = null;
    this.emit();
  }

  private dispatchQte(event: QteEvent) {
    const step = this.currentStep();
    if (
      step?.type !== "qte" ||
      !this.qte ||
      !this.qteMachine ||
      !this.qteState ||
      this.qte.outcome
    ) {
      return;
    }

    const { state: next, effects } = this.qteMachine.reduce(
      this.qteState,
      event,
    );
    if (next === this.qteState) return;

    this.qteState = next;
    for (const effect of effects) this.onEffect?.(effect);
    if (next.outcome && !this.qte.outcome) {
      this.setQteOutcome(FLOW_OUTCOME[next.outcome]);
    }
    this.emit();
  }

  private setQteOutcome(outcome: Exclude<QteOutcome, null>) {
    if (!this.qte || this.qte.outcome) return;

    this.qte.outcome = outcome;
    this.outcomes[this.qte.id] = outcome;
    this.qteResolvedMs = 0;
    this.emit();
  }

  private currentStep(): FlowStep | null {
    return this.script?.steps[this.stepIndex] ?? null;
  }

  private createSnapshot(): FlowSnapshot {
    const step = this.currentStep();
    const qteStep = step?.type === "qte" ? step : null;
    let qte: FlowQteSnapshot | null = null;

    if (qteStep && this.qte && this.qteState) {
      qte = {
        id: this.qte.id,
        spec: qteStep.qte,
        state: this.qteState,
        outcome: this.qte.outcome,
      };
    }

    return {
      phase: this.phase,
      sequenceId: this.sequenceId,
      stepId: step?.id ?? null,
      title: step?.title ?? null,
      caption: step?.caption ?? undefined,
      camera: this.camera,
      cameraEpoch: this.cameraEpoch,
      qte,
      qteOutcomes: { ...this.outcomes },
    };
  }

  private emit() {
    this.snapshot = this.createSnapshot();
    this.listeners.forEach((listener) => listener());
  }
}
