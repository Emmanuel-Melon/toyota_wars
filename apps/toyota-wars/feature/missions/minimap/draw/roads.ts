import type { DrawContext } from "../types";

export function drawRoads({ ctx, state, projection }: DrawContext): void {
  const { toX, toY, scale } = projection;
  ctx.strokeStyle = "rgba(210, 190, 150, 0.34)";
  ctx.lineCap = "round";
  for (const path of state.arena.roads.paths) {
    ctx.lineWidth = Math.max(1.5, path.width * scale);
    ctx.beginPath();
    ctx.moveTo(toX(path.x[0]), toY(path.z[0]));
    for (let i = 4; i < path.count; i += 4) {
      ctx.lineTo(toX(path.x[i]), toY(path.z[i]));
    }
    ctx.lineTo(toX(path.x[path.count - 1]), toY(path.z[path.count - 1]));
    ctx.stroke();
  }
}
