import type { DrawContext } from "../types";

export function drawGrid({ ctx, size }: DrawContext): void {
  ctx.strokeStyle = "rgba(247, 237, 218, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const offset = (size / 4) * i;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, size);
    ctx.moveTo(0, offset);
    ctx.lineTo(size, offset);
    ctx.stroke();
  }
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
}
