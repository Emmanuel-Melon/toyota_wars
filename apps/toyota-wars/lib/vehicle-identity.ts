import type { Team } from "@toyota/combat";
import {
  ALLY_PALETTES,
  ENEMY_PALETTES,
  type VehiclePalette,
} from "@/lib/palettes";

const ALLY_SHADES: readonly VehiclePalette[] = Object.values(ALLY_PALETTES);
const ENEMY_SHADES: readonly VehiclePalette[] = Object.values(ENEMY_PALETTES);

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function hashUnitId(unitId: string): number {
  return hashString(unitId) / 4294967295;
}

export function pickFactionPalette(team: Team, unitId: string): VehiclePalette {
  const shades = team === "ally" ? ALLY_SHADES : ENEMY_SHADES;
  return shades[hashString(unitId) % shades.length];
}

export function vehicleNumberForUnitId(unitId: string): string {
  return String((hashString(`number:${unitId}`) % 99) + 1).padStart(2, "0");
}
