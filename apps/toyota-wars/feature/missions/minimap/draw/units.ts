import { getMissionUnitPositions } from "@/lib/missions/mission-unit-positions";
import type { DrawContext } from "../types";
import { ALLY_COLOR, ENEMY_COLOR, TAU } from "../colors";

export function drawUnits({ ctx, state, projection }: DrawContext): void {
  const { toX, toY } = projection;
  const positions = getMissionUnitPositions();

  const resolve = (id: string, fallback: readonly number[]) => {
    const live = positions.get(id);
    return live ? { x: live.x, z: live.z } : { x: fallback[0], z: fallback[2] };
  };

  if (state.enemiesVisible) {
    ctx.fillStyle = ENEMY_COLOR;
    for (const enemy of state.enemies) {
      if ((state.health[enemy.id] ?? 0) <= 0) continue;
      const p = resolve(enemy.id, enemy.position);
      ctx.beginPath();
      ctx.arc(toX(p.x), toY(p.z), 2.8, 0, TAU);
      ctx.fill();
    }
  }

  ctx.fillStyle = ALLY_COLOR;
  for (const ally of state.allyTargets) {
    if ((state.health[ally.id] ?? 0) <= 0) continue;
    const p = resolve(ally.id, ally.position);
    ctx.beginPath();
    ctx.arc(toX(p.x), toY(p.z), 2.4, 0, TAU);
    ctx.fill();
  }
}
