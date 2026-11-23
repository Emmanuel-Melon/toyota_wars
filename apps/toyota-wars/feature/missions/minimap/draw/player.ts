import type { DrawContext } from "../types";
import { PLAYER_COLOR } from "../colors";

export function drawPlayer({ ctx, state, projection }: DrawContext): void {
  const { toX, toY } = projection;
  const { position, heading } = state.playerBody;

  const headingX = Math.sin(heading);
  const headingZ = Math.cos(heading);
  const sideX = -headingZ;
  const sideZ = headingX;

  const tipX = position.x + headingX * 4.5;
  const tipZ = position.z + headingZ * 4.5;
  const rearX = position.x - headingX * 3.2;
  const rearZ = position.z - headingZ * 3.2;

  ctx.fillStyle = PLAYER_COLOR;
  ctx.strokeStyle = "rgba(27, 26, 22, 0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(toX(tipX), toY(tipZ));
  ctx.lineTo(toX(rearX + sideX * 2.8), toY(rearZ + sideZ * 2.8));
  ctx.lineTo(toX(rearX - sideX * 2.8), toY(rearZ - sideZ * 2.8));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
