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
      className="pointer-events-none w-full p-3 max-[919px]:p-1"
      aria-label="Tactical minimap"
    >
      <MinimapHeader
        title={title}
        distanceRef={distanceRef}
        bearingRef={bearingRef}
      />
      <MinimapCanvas canvasRef={canvasRef} />
    </HudPanel>
  );
}
