"use client";

import { useEffect } from "react";
import { useMissionFlow, useMissionFlowRunner } from "../mission-flow.context";
import styles from "./qte-overlay.module.css";

export function QteOverlay() {
  const flow = useMissionFlow();
  const runner = useMissionFlowRunner();
  const qte = flow.qte;

  useEffect(() => {
    if (!qte || qte.outcome) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        runner.skip();
        return;
      }

      if (!qte.keys.some((allowed) => allowed.toLowerCase() === key)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      runner.resolveQte(key);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [qte, runner]);

  if (!qte) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15] grid place-items-center text-ui-text"
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute inset-x-0 top-0 h-[10%] bg-black/60" />
      <div className="pointer-events-auto w-[min(520px,calc(100vw-32px))] border border-ui-secondary/40 bg-ui-panel/90 p-5 text-center shadow-[0_24px_70px_rgb(0_0_0/0.45)]">
        <div className="font-mono text-[10px] font-semibold tracking-[0.22em] text-ui-primary uppercase">
          {flow.title}
        </div>
        <div className="mt-2 font-mono text-[clamp(18px,4vw,28px)] font-bold tracking-[0.04em] uppercase">
          {qte.prompt}
        </div>
        <p className="mt-2 font-mono text-[12px] leading-[1.5] text-ui-text/80">
          {qte.detail}
        </p>
        <div className="mt-4 h-[4px] overflow-hidden bg-ui-secondary/25">
          <span
            className={styles.progressFill}
            style={{
              animationDuration: `${qte.durationMs}ms`,
              animationPlayState: qte.outcome ? "paused" : "running",
            }}
          />
        </div>
        {qte.outcome ? (
          <div className="mt-4 font-mono text-[12px] font-bold tracking-[0.16em] text-ui-primary uppercase">
            {qte.outcome === "success" ? "Dodged" : "Hit"}
          </div>
        ) : (
          <div className="mt-4 flex justify-center gap-3">
            {qte.keys.map((key, index) => (
              <button
                key={`${key}-${index}`}
                type="button"
                className="min-h-12 min-w-12 rounded-[8px] border-2 border-ui-secondary/55 bg-ui-panel/90 px-4 font-mono text-[20px] font-bold text-ui-text"
                onClick={() => runner.resolveQte(key)}
              >
                {qte.labels[index] ?? key.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
