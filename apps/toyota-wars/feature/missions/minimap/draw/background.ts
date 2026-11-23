import type { DrawContext } from "../types";

export function drawBackground({ ctx, size }: DrawContext): void {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(15, 14, 11, 0.34)";
  ctx.fillRect(0, 0, size, size);
}
