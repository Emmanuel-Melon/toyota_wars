"use client";

import { useRef } from "react";
import { HudPanel } from "@/feature/hud/components/hud-parts";
import { MinimapCanvas } from "./minimap-canvas";
import { MinimapHeader } from "./minimap-header";
import { useMinimapRender } from "./use-minimap-render";
import { useMinimapState } from "./use-minimap-state";

export function MissionMinimap() {
  const { stateRef, activeObjective, objectives } = useMinimapState();
  const title =
    objectives.find((objective) => objective.id === activeObjective?.id)
      ?.title ?? "TACTICAL MAP";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const distanceRef = useRef<HTMLSpanElement>(null);
  const bearingRef = useRef<HTMLSpanElement>(null);

  useMinimapRender({ canvasRef, distanceRef, bearingRef, stateRef });

  return (
    <HudPanel
      className="pointer-events-none relative aspect-square w-full p-0"
      style={{ borderRadius: "50%", overflow: "hidden" }}
      aria-label="Tactical minimap"
    >
      <div className="pointer-events-none absolute inset-x-[14%] top-[18%] z-10">
        <MinimapHeader
          title={title}
          distanceRef={distanceRef}
          bearingRef={bearingRef}
        />
      </div>
      <MinimapCanvas canvasRef={canvasRef} />
      <div className="pointer-events-none absolute inset-[4px] z-[5] rounded-full border border-ui-secondary/50" />
    </HudPanel>
  );
}
