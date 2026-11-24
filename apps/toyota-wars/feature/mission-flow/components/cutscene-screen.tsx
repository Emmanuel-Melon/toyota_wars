"use client";

import { useEffect } from "react";
import { useMissionFlow, useMissionFlowRunner } from "../mission-flow.context";

export function CutsceneScreen() {
  const flow = useMissionFlow();
  const runner = useMissionFlowRunner();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      runner.skip();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [runner]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[14] text-ui-text"
      role="region"
      aria-label="Cutscene"
    >
      <div className="absolute inset-x-0 top-0 h-[12%] bg-black/80" />
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-black/80" />
      <button
        type="button"
        className="pointer-events-auto absolute right-6 top-6 border border-ui-secondary/40 bg-ui-panel/70 px-3 py-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-ui-text/80 uppercase"
        onClick={() => runner.skip()}
      >
        Skip · Esc
      </button>
      <div className="absolute bottom-[6%] left-1/2 w-[min(720px,calc(100vw-48px))] -translate-x-1/2 text-center">
        <div className="font-mono text-[10px] font-semibold tracking-[0.24em] text-ui-primary uppercase">
          {flow.title}
        </div>
        <p className="mt-3 font-mono text-[clamp(14px,2vw,20px)] font-bold leading-[1.5] tracking-[0.04em] uppercase">
          {flow.caption}
        </p>
      </div>
    </div>
  );
}
