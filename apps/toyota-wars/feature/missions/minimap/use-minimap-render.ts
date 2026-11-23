"use client";

import { useEffect, type RefObject } from "react";
import type { DrawContext, MinimapState } from "./types";
import { createProjection } from "./projection";
import {
  drawBackground,
  drawGrid,
  drawRoads,
  drawObstacles,
  drawObjective,
  drawUnits,
  drawPlayer,
  drawCompass,
} from "./draw";
import { updateNav } from "./update-nav";

type Params = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  distanceRef: RefObject<HTMLSpanElement | null>;
  bearingRef: RefObject<HTMLSpanElement | null>;
  stateRef: RefObject<MinimapState>;
};

/**
 * Owns the canvas lifecycle (size, DPR, rAF) and runs the draw passes in
 * order each frame. Passes are intentionally listed explicitly — visual
 * layering is easiest to reason about when the order is right there.
 */
export function useMinimapRender({
  canvasRef,
  distanceRef,
  bearingRef,
  stateRef,
}: Params): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let requestId = 0;
    let size = 0;

    const resize = () => {
      const next = canvas.clientWidth;
      if (!next) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixels = Math.round(next * dpr);
      if (canvas.width !== pixels || canvas.height !== pixels) {
        canvas.width = pixels;
        canvas.height = pixels;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = next;
    };

    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    observer?.observe(canvas);
    resize();

    const draw = (time: number) => {
      resize();
      if (size === 0) {
        requestId = requestAnimationFrame(draw);
        return;
      }

      const state = stateRef.current;
      const projection = createProjection(state.arena.bound, size);
      const frame: DrawContext = { ctx, time, size, projection, state };

      drawBackground(frame);
      drawGrid(frame);
      drawRoads(frame);
      drawObstacles(frame);
      drawObjective(frame);
      drawUnits(frame);
      drawPlayer(frame);
      drawCompass(frame);

      updateNav(distanceRef.current, bearingRef.current, state);

      requestId = requestAnimationFrame(draw);
    };

    requestId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(requestId);
      observer?.disconnect();
    };
  }, [canvasRef, distanceRef, bearingRef, stateRef]);
}
