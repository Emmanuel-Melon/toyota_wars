"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { QteInput } from "@/lib/mission-flow/qte/qte.types";
import { cn } from "@/lib/utils";

import { useMissionFlow, useMissionFlowRunner } from "../mission-flow.context";
import styles from "./qte-overlay.module.css";

const OUTCOME_LABEL = {
  success: "Success",
  failure: "Failed",
  skipped: "Skipped",
} as const;

const PRESS_CLEAR_MS = 350;

export function QteOverlay() {
  const flow = useMissionFlow();
  const runner = useMissionFlowRunner();
  const qte = flow.qte;
  const [pressedLabel, setPressedLabel] = useState<string | null>(null);
  const [pressId, setPressId] = useState(0);
  const clearPress = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prompts = qte?.spec.prompts ?? [];
  const actionPrompt =
    prompts.find((prompt) => qte?.state.prompts[prompt.id] === "active") ??
    prompts.find((prompt) => qte?.state.prompts[prompt.id] === "pending");
  const statusPrompt =
    actionPrompt ??
    prompts.find((prompt) => qte?.state.prompts[prompt.id] === "hit") ??
    prompts.find((prompt) => qte?.state.prompts[prompt.id] === "missed");
  const outcomeLabel = qte?.outcome ? OUTCOME_LABEL[qte.outcome] : null;

  const triggerPress = useCallback(
    (input: QteInput, key: string) => {
      setPressedLabel(input.label);
      setPressId((id) => id + 1);
      runner.resolveQte(key);
      if (clearPress.current) clearTimeout(clearPress.current);
      clearPress.current = setTimeout(
        () => setPressedLabel(null),
        PRESS_CLEAR_MS,
      );
    },
    [runner],
  );

  useEffect(() => {
    if (!qte || qte.outcome) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        runner.skip();
        return;
      }

      const key = event.key.toLowerCase();
      const input = actionPrompt?.inputs.find((candidate) =>
        candidate.keys.some(
          (candidateKey) => candidateKey.toLowerCase() === key,
        ),
      );

      event.preventDefault();
      event.stopImmediatePropagation();

      if (input) triggerPress(input, key);
      else runner.resolveQte(key);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [actionPrompt, qte, runner, triggerPress]);

  useEffect(() => {
    return () => {
      if (clearPress.current) clearTimeout(clearPress.current);
    };
  }, []);

  if (!qte) return null;

  const hitCount = prompts.filter(
    (prompt) => qte.state.prompts[prompt.id] === "hit",
  ).length;
  const missedCount = prompts.filter(
    (prompt) => qte.state.prompts[prompt.id] === "missed",
  ).length;
  const kicker = outcomeLabel ? "QUICK TIME EVENT" : flow.title;
  const title = outcomeLabel ?? statusPrompt?.text ?? "React";
  const detail =
    statusPrompt?.detail ?? flow.caption ?? "Respond before the window closes.";
  const statusHint =
    missedCount > 0
      ? `${missedCount} MISSED`
      : hitCount > 0
        ? `${hitCount} DONE`
        : null;
  const hint = outcomeLabel
    ? "SEQUENCE COMPLETE"
    : (statusHint ?? "ESC TO SKIP");

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] text-ui-text"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={cn(
          styles.panel,
          "absolute left-1/2 top-8 w-[min(420px,calc(100vw-32px))] -translate-x-1/2 rounded-md border border-ui-secondary/30 px-4 pb-3 pt-[14px] text-center text-ui-text shadow-[0_18px_48px_rgb(var(--ui-panel-rgb)/0.5)] max-[919px]:top-4",
        )}
      >
        <span className="font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.16em] text-ui-primary uppercase">
          {kicker}
        </span>
        <div className="mt-2 font-mono text-[18px] font-bold leading-[1.3] tracking-[0.06em] uppercase">
          {title}
        </div>
        <p className="mt-[5px] font-mono text-[12px] leading-[1.5] text-ui-text/80">
          {detail}
        </p>
        <div className="mt-[9px] font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.12em] text-ui-primary/95 uppercase">
          {hint}
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {prompts.map((prompt) => {
            const status = qte.state.prompts[prompt.id] ?? "pending";
            return (
              <span
                key={prompt.id}
                className={cn(
                  "h-[3px] flex-1 bg-ui-secondary/25",
                  status === "hit" && "bg-ui-primary",
                  status === "active" && "bg-ui-primary/60",
                  status === "missed" && "bg-red-400/70",
                )}
              />
            );
          })}
        </div>
      </div>

      {statusPrompt && (!outcomeLabel || pressedLabel) ? (
        <div className="pointer-events-auto absolute left-1/2 top-1/2 flex w-[min(420px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-[14px]">
          {statusPrompt.inputs.map((input) => {
            const pressed = pressedLabel === input.label;
            return (
              <button
                key={`${statusPrompt.id}-${input.id}-${pressed ? pressId : "idle"}`}
                type="button"
                disabled={Boolean(outcomeLabel)}
                aria-label={`Press ${input.label}`}
                className={cn(
                  styles.key,
                  "grid min-h-16 min-w-16 place-items-center rounded-[10px] border-2 border-ui-secondary/55 bg-ui-panel/90 p-[10px_14px] font-mono text-[28px] font-bold leading-none text-ui-text shadow-[0_6px_0_rgb(var(--ui-panel-rgb)/0.7),0_18px_40px_rgb(var(--ui-panel-rgb)/0.45)] max-[919px]:min-h-[52px] max-[919px]:min-w-[52px] max-[919px]:text-[22px]",
                  pressed &&
                    cn(
                      styles.pressed,
                      "border-ui-primary bg-ui-primary text-ui-panel shadow-[0_4px_0_rgb(var(--ui-panel-rgb)/0.7),0_0_36px_rgb(var(--ui-primary-rgb)/0.5)]",
                    ),
                )}
                onClick={() => triggerPress(input, input.keys[0] ?? "")}
              >
                {input.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {!outcomeLabel ? (
        <div className="absolute bottom-[12%] left-1/2 w-[min(420px,calc(100vw-48px))] -translate-x-1/2">
          <div className="h-[4px] overflow-hidden bg-ui-secondary/25">
            <span
              className={styles.progressFill}
              style={{
                animationDuration: `${qte.spec.durationMs}ms`,
                animationPlayState: "running",
              }}
            />
          </div>
          <div className="mt-2 text-center font-mono text-[10px] font-semibold tracking-[0.18em] text-ui-text/60 uppercase">
            ESC TO SKIP
          </div>
        </div>
      ) : null}
    </div>
  );
}
