// lib/aim/aim.state.ts
import { AIM_LIMIT } from "./aim.config";
import type { AimState } from "./aim.types";

export function clampAim(aim: AimState): AimState {
  return {
    x: Math.max(-AIM_LIMIT, Math.min(AIM_LIMIT, aim.x)),
    y: Math.max(-AIM_LIMIT, Math.min(AIM_LIMIT, aim.y)),
  };
}
