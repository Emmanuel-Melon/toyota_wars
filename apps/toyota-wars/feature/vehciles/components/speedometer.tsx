"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/player-context";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";
const MAX_KMH = 80; // TODO: take from vehicle config
const DIGITS = 3;

export function Speedometer({ compact = false }: { compact?: boolean }) {
  const { playerBody } = usePlayer();
  const zerosRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const motionRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = -1;

    const update = () => {
      const speed = Math.abs(playerBody.speedKmh);
      const rounded = Math.round(speed);

      if (rounded !== last) {
        last = rounded;
        const value = String(rounded);
        const zeros = "0".repeat(Math.max(0, DIGITS - value.length));
        if (zerosRef.current) zerosRef.current.textContent = zeros;
        if (valueRef.current) valueRef.current.textContent = value;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${Math.min(1, speed / MAX_KMH)})`;
        }
        if (motionRef.current) motionRef.current.style.opacity = speed > 1 ? "1" : "0.3";
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [playerBody]);

  const digits = (
    <span className={compact ? "text-[18px] font-bold leading-none" : "text-[24px] font-bold leading-none tracking-[-0.04em]"}>
      <span ref={zerosRef} className="opacity-25">00</span>
      <span ref={valueRef}>0</span>
    </span>
  );

  return (
    <HudPanel
      rust="small"
      className={`pointer-events-none ${compact ? layout.mobileSpeed : layout.mapSpeed}`}
      aria-label="Speed"
    >
      {compact ? (
        <div className="flex items-baseline justify-end gap-1.5 font-mono tabular-nums">
          {digits}
          <span className="text-[9px] font-semibold tracking-[0.1em] opacity-70">KM/H</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            ref={motionRef}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="h-6 w-6 shrink-0 text-ui-primary opacity-30 transition-opacity duration-150"
            aria-hidden="true"
          >
            <path d="M3 8h11" />
            <path d="M3 13h15" />
            <path d="M3 18h8" />
          </svg>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1 font-mono tabular-nums">
              {digits}
              <span className="text-[8px] font-semibold tracking-[0.12em] opacity-70">KM/H</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden bg-black/40">
              <div
                ref={barRef}
                className="h-full origin-left bg-ui-primary"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        </div>
      )}
    </HudPanel>
  );
}