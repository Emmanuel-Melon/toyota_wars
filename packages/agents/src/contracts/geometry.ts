export interface Vec2 {
  x: number;
  y: number;
}

export type AgentVec2 = Readonly<Vec2>;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type AgentVec3 = Readonly<Vec3>;

export function distanceXZ(
  a: AgentVec3 | AgentVec2,
  b: AgentVec3 | AgentVec2,
): number {
  const bz = "z" in b ? b.z : b.y;
  const az = "z" in a ? a.z : a.y;
  return Math.hypot(b.x - a.x, bz - az);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function headingTo(from: AgentVec3, to: AgentVec3): number {
  return Math.atan2(to.x - from.x, to.z - from.z);
}

export function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function alignmentError(current: number, desired: number): number {
  return wrapAngle(desired - current);
}
