import type { DrawContext } from "../types";
import { OBJECTIVE_COLOR, TAU } from "../colors";

export function drawObjective({
  ctx,
  state,
  projection,
  time,
}: DrawContext): void {
  const target = state.objective?.targetPoint;
  if (!target) return;

  const { toX, toY, scale } = projection;
  const x = toX(target.x);
  const y = toY(target.z);
  const radius = Math.max(4, (state.objective?.radius ?? 0) * scale);
  const pulse = 1 + Math.sin(time / 420) * 0.03;

  ctx.fillStyle = "rgba(210, 122, 56, 0.2)";
  ctx.beginPath();
  ctx.arc(x, y, radius * pulse, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = OBJECTIVE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius * pulse, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = OBJECTIVE_COLOR;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, TAU);
  ctx.fill();
}
