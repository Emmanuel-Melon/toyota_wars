// apps/toyota-wars/lib/missions/mission-unit-positions.ts
import type { Vec2 } from "@/lib/missions/definition/mission.types";

let positions: ReadonlyMap<string, Vec2> = new Map();

export function setMissionUnitPositions(next: ReadonlyMap<string, Vec2>): void {
  positions = next;
}

export function getMissionUnitPositions(): ReadonlyMap<string, Vec2> {
  return positions;
}

export function clearMissionUnitPositions(): void {
  positions = new Map();
}
