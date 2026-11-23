import type { Mission } from "./definition/mission.types";
import { MISSIONS } from "./missions.data";

const ORDERED_MISSIONS = [...MISSIONS].sort((a, b) => a.order - b.order);

export function getNextMission(current: Mission): Mission | null {
  const index = ORDERED_MISSIONS.findIndex(
    (mission) => mission.id === current.id,
  );
  if (index === -1) return null;
  return ORDERED_MISSIONS[index + 1] ?? null;
}
