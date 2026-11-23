import type { DrawContext } from "../types";
import { TAU } from "../colors";

export function drawObstacles({ ctx, state, projection }: DrawContext): void {
  const { toX, toY, scale } = projection;
  ctx.fillStyle = "rgba(27, 26, 22, 0.42)";
  for (const obstacle of state.arena.obstacles) {
    const x = toX(obstacle.position.x);
    const y = toY(obstacle.position.z);

    if (
      obstacle.shape === "box" &&
      obstacle.halfWidth !== undefined &&
      obstacle.halfDepth !== undefined
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-(obstacle.yaw ?? 0));
      ctx.fillRect(
        -obstacle.halfWidth * scale,
        -obstacle.halfDepth * scale,
        obstacle.halfWidth * 2 * scale,
        obstacle.halfDepth * 2 * scale,
      );
      ctx.restore();
      continue;
    }

    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, obstacle.radius * scale), 0, TAU);
    ctx.fill();
  }
}
