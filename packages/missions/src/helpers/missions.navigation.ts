import type { Vec2 } from "../missions.types";

const BEARINGS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export function distance2D(fromX: number, fromZ: number, to: Vec2): number {
  return Math.hypot(to.x - fromX, to.z - fromZ);
}

export function cardinalBearing(
  fromX: number,
  fromZ: number,
  to: Vec2,
): string {
  const angle = Math.atan2(to.x - fromX, fromZ - to.z);
  const normalized = (angle + Math.PI * 2) % (Math.PI * 2);
  const index = Math.round(normalized / (Math.PI / 4)) % BEARINGS.length;
  return BEARINGS[index];
}

export function formatDistance(distance: number): string {
  return `${Math.round(distance)}m`;
}
