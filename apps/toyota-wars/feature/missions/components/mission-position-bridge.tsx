"use client";

import { useGameFrame } from "@/render-loop";
import { useBattle } from "@/context/battle-context";
import { useMissionRunner } from "@/context/missions.context";
import { setMissionUnitPositions } from "@toyota/missions";
import type { Vec2 } from "@toyota/missions";

export function MissionPositionBridge() {
  const { registry } = useBattle();
  const runner = useMissionRunner();

  useGameFrame(() => {
    const positions = new Map<string, Vec2>();
    for (const unit of registry.all()) {
      positions.set(unit.id, { x: unit.position.x, z: unit.position.z });
    }
    runner.setUnitPositions(positions);
    setMissionUnitPositions(positions);
  }, "missionPositions");

  return null;
}
