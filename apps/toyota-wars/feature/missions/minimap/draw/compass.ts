import type { DrawContext } from "../types";

export function drawCompass({ ctx, size }: DrawContext): void {
  ctx.fillStyle = "rgba(247, 237, 218, 0.72)";
  ctx.font = "600 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("N", size / 2, 11);
}
