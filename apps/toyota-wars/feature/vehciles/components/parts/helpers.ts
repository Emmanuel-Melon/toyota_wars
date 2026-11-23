import { AXLE_Y, WHEEL } from "@/feature/vehciles/vehicles.config";

/** Y of the ground plane, derived from the wheel contact point. */
export const GROUND_Y = AXLE_Y - WHEEL.radius;

/** Distance a part at `y` must fall to land on the ground. */
export function dropToGround(y: number): number {
  return y - GROUND_Y;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
