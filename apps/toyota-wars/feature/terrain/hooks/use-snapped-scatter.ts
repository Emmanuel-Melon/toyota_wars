// apps/toyota-wars/feature/terrain/hooks/use-snapped-scatter.ts
import { useRef } from "react";
import { useGameFrame } from "@/render-loop";

type WorldPosition = { readonly x: number; readonly z: number };

/**
 * Calls `scatter` with the snapped center whenever the player crosses into a new
 * snap cell. Returns the initial snapped center for the field's first scatter.
 */
export function useSnappedScatter(
  playerBody: { readonly position: WorldPosition },
  snapStep: number,
  scatter: (centerX: number, centerZ: number) => void,
) {
  const scatterRef = useRef(scatter);
  scatterRef.current = scatter;

  const cx0 = Math.round(playerBody.position.x / snapStep);
  const cz0 = Math.round(playerBody.position.z / snapStep);
  const initialCenter = useRef({ x: cx0 * snapStep, z: cz0 * snapStep }).current;
  const cellRef = useRef({ cx: cx0, cz: cz0, step: snapStep });

  useGameFrame(() => {
    const cx = Math.round(playerBody.position.x / snapStep);
    const cz = Math.round(playerBody.position.z / snapStep);
    const cell = cellRef.current;
    if (cell.cx === cx && cell.cz === cz && cell.step === snapStep) return;
    cellRef.current = { cx, cz, step: snapStep };
    scatterRef.current(cx * snapStep, cz * snapStep);
  }, "presentation");

  return initialCenter;
}