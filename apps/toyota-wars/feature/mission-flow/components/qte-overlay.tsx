"use client";

import { useEffect } from "react";
import { useMissionFlow, useMissionFlowRunner } from "../mission-flow.context";
import type { QtePrompt } from "@/lib/mission-flow/qte/qte.types";
import styles from "./qte-overlay.module.css";

const OUTCOME_LABEL = {
  success: "Success",
  failure: "Failed",
  skipped: "Skipped",
} as const;

function PromptCard({
  prompt,
  status,
  onPress,
}: {
  prompt: QtePrompt;
  status: string;
  onPress: (key: string) => void;
}) {
  const active = status === "active";
  return (
    <div
      className={`border p-3 text-center ${
        active
          ? "border-ui-primary/60 bg-ui-panel/95"
          : "border-ui-secondary/30 bg-ui-panel/70 opacity-70"
      }`}
    >
      <div className="font-mono text-[13px] font-bold tracking-[0.14em] uppercase">
        {prompt.text}
      </div>
      {prompt.detail && (
        <p className="mt-1 font-mono text-[11px] text-ui-text/75">
          {prompt.detail}
        </p>
      )}
      {active && (
        <div className="mt-3 flex justify-center gap-3">
          {prompt.inputs.map((input) => (
            <button
              key={input.id}
              type="button"
              className="min-h-11 min-w-11 rounded-[8px] border-2 border-ui-secondary/55 bg-ui-panel/90 px-4 font-mono text-[18px] font-bold text-ui-text"
              onClick={() => onPress(input.keys[0] ?? "")}
            >
              {input.label}
            </button>
          ))}
        </div>
      )}
      {status === "hit" && (
        <div className="mt-2 font-mono text-[11px] font-bold tracking-[0.16em] text-ui-primary uppercase">
          Done
        </div>
      )}
      {status === "missed" && (
        <div className="mt-2 font-mono text-[11px] font-bold tracking-[0.16em] text-red-400 uppercase">
          Missed
        </div>
      )}
    </div>
  );
}

export function QteOverlay() {
  const flow = useMissionFlow();
  const runner = useMissionFlowRunner();
  const qte = flow.qte;

  useEffect(() => {
    if (!qte || qte.outcome) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        runner.skip();
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      runner.resolveQte(event.key);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [qte, runner]);

  if (!qte) return null;

  const openPrompts = qte.spec.prompts.filter((prompt) => {
    const status = qte.state.prompts[prompt.id];
    return status === "pending" || status === "active";
  });
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] grid place-items-center text-ui-text"
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute inset-x-0 top-0 h-[10%] bg-black/60" />
      <div className="pointer-events-auto flex w-[min(560px,calc(100vw-32px))] flex-col gap-3 border border-ui-secondary/40 bg-ui-panel/90 p-5 text-center shadow-[0_24px_70px_rgb(0_0_0/0.45)]">
        <div className="font-mono text-[10px] font-semibold tracking-[0.22em] text-ui-primary uppercase">
          {flow.title}
        </div>
        {qte.outcome ? (
          <div className="mt-2 font-mono text-[clamp(18px,4vw,28px)] font-bold tracking-[0.04em] uppercase">
            {OUTCOME_LABEL[qte.outcome]}
          </div>
        ) : (
          <>
            {openPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                status={qte.state.prompts[prompt.id] ?? "pending"}
                onPress={(key) => runner.resolveQte(key)}
              />
            ))}
            <div className="h-[4px] overflow-hidden bg-ui-secondary/25">
              <span
                className={styles.progressFill}
                style={{
                  animationDuration: `${qte.spec.durationMs}ms`,
                  animationPlayState: "running",
                }}
              />
            </div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-ui-text/60 uppercase">
              Esc to skip
            </div>
          </>
        )}
      </div>
    </div>
  );
}
