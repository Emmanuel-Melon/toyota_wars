import type {
  FlowCameraMode,
  FlowPhase,
  FlowQteSnapshot,
  FlowRuntime,
  FlowScript,
  FlowSnapshot,
  FlowStep,
  QteOutcome,
} from "./mission-flow.types";

const QTE_RESOLVE_HOLD_MS = 420;
const MAX_FRAME_MS = 100;

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
  private outcomes: Record<string, QteOutcome> = {};
  private listeners = new Set<() => void>();
  private snapshot = this.createSnapshot();

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

      if (this.elapsedMs >= step.durationMs) {
        this.setQteOutcome("failure");
      }
      return;
    }

    if (this.elapsedMs >= step.durationMs) this.advance();
  }

  resolveQte(key: string) {
    const step = this.currentStep();
    if (
      this.phase !== "qte" ||
      !step ||
      step.type !== "qte" ||
      !this.qte ||
      this.qte.outcome
    ) {
      return;
    }

    const candidate = key.toLowerCase();
    if (!step.qte.keys.some((allowed) => allowed.toLowerCase() === candidate)) {
      return;
    }

    this.setQteOutcome("success");
  }

  skip() {
    if (this.phase === "gameplay") return;

    const step = this.currentStep();
    if (step?.type === "qte" && this.qte && !this.qte.outcome) {
      this.setQteOutcome("failure");
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
    this.qte = step.type === "qte" ? { id: step.id, outcome: null } : null;
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

    if (qteStep && this.qte) {
      qte = {
        id: this.qte.id,
        prompt: qteStep.qte.prompt,
        detail: qteStep.qte.detail,
        keys: qteStep.qte.keys,
        labels: qteStep.qte.labels,
        durationMs: qteStep.qte.durationMs,
        outcome: this.qte.outcome,
      };
    }

    return {
      phase: this.phase,
      sequenceId: this.sequenceId,
      stepId: step?.id ?? null,
      title: step?.title ?? null,
      caption: step?.caption ?? null,
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
