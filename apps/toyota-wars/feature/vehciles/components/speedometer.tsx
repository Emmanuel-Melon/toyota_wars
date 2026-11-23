// apps/toyota-wars/feature/vehciles/components/speedometer.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePlayer } from "@/context/player-context";
import layout from "@/feature/hud/components/hud-layout.module.css";
import { HudPanel } from "@/feature/hud/components/hud-parts";
import { createPlayerBodyConfig } from "@/lib/vehicles/vehicle.config";

export function Speedometer({ compact = false }: { compact?: boolean }) {
  const { playerBody, playerVehicle, playerDamageEffects } = usePlayer();
  const bodyConfig = useMemo(
    () => createPlayerBodyConfig(playerVehicle),
    [playerVehicle],
  );
  const MIN_KMH = Math.round(bodyConfig.minForwardSpeed * 3.6);
  const MAX_KMH = Math.round(
    bodyConfig.maxSpeed * playerDamageEffects.maxSpeedFactor * 3.6,
  );
  const currentRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const speed = Math.abs(playerBody.speedKmh);
      if (currentRef.current) {
        currentRef.current.textContent = `${Math.round(speed)}`;
      }
      if (fillRef.current) {
        const percent = Math.min(100, (speed / MAX_KMH) * 100);
        fillRef.current.style.width = `${percent}%`;
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [playerBody, MAX_KMH]);

  return (
    <HudPanel
      className={`pointer-events-none ${compact ? layout.mobileSpeed : layout.desktopSpeed}`}
      aria-label="Speed"
    >
      {compact ? (
        <div className="flex items-baseline justify-end gap-1.5 font-mono tabular-nums">
          <span ref={currentRef} className="text-[18px] font-bold leading-none">
            0
          </span>
          <span className="text-[9px] font-semibold tracking-[0.1em] opacity-70">
            KM/H
          </span>
        </div>
      ) : (
        <>
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase leading-[1.2] tracking-[0.16em] opacity-70">
            <span>SPEED</span>
            <span>KM/H</span>
          </div>
          <div className="mb-[10px] mt-[7px] flex items-baseline gap-1.5">
            <span
              ref={currentRef}
              className="font-mono text-[32px] font-bold leading-[0.9] tabular-nums tracking-[-0.04em]"
            >
              0
            </span>
            <span className="ml-auto font-mono text-[11px] font-semibold tabular-nums tracking-[0.08em] opacity-60">
              / {MAX_KMH}
            </span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-[3px] bg-white/20">
            <span
              className="absolute inset-y-0 z-[1] w-px bg-ui-secondary/55"
              style={{ left: `${(MIN_KMH / MAX_KMH) * 100}%` }}
            />
            <div
              ref={fillRef}
              className="h-full w-0 rounded-[inherit] bg-gradient-to-r from-ui-primary/80 to-ui-primary shadow-[0_0_10px_rgb(var(--ui-primary-rgb)/0.35)] transition-[width] duration-[80ms] ease-linear"
            />
          </div>
        </>
      )}
    </HudPanel>
  );
}
