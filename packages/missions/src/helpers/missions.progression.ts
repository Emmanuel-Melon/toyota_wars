import type { Mission } from "../missions.types";

export function getNextMission(
  missions: readonly Mission[],
  current: Mission,
): Mission | null {
  const ordered = [...missions].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((mission) => mission.id === current.id);
  if (index === -1) return null;
  return ordered[index + 1] ?? null;
}
