"use client";

import { useGameFrame } from "@/render-loop";
import { type EnemyTarget, COMBAT_CONFIG } from "@toyota/combat";
import type { Unit } from "@/lib/squad/squad.registry";
import { useTargets } from "@/context/targets-context";
import { useArena } from "@/context/arena-context";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import { useBattle } from "../../../context/battle-context";

function updateTargetPositions(
  targets: EnemyTarget[],
  units: readonly Unit[],
  terrain: TerrainSampler,
) {
  for (const target of targets) {
    const unit = units.find((candidate) => candidate.id === target.id);
    if (!unit) continue;

    target.position[0] = unit.position.x;
    target.position[1] = terrain.getVehicleHeight(
      unit.position.x,
      unit.position.z,
    );
    target.position[2] = unit.position.z;
    target.heading = unit.body.heading;
  }
}

export function PositionTracker() {
  const { playerTarget, enemies: enemyTargets, allyTargets } = useTargets();
  const { registry } = useBattle();
  const arena = useArena();

  useGameFrame(() => {
    const player = registry.get(COMBAT_CONFIG.PLAYER_ID);
    if (player) {
      playerTarget.current.position = [
        player.position.x,
        arena.terrain.getVehicleHeight(player.position.x, player.position.z),
        player.position.z,
      ];
      playerTarget.current.heading = player.body.heading;
    }

    updateTargetPositions(
      enemyTargets,
      registry.byTeam("enemy"),
      arena.terrain,
    );
    updateTargetPositions(
      allyTargets,
      registry.byTeam("ally").filter((unit) => unit.kind !== "player"),
      arena.terrain,
    );
  }, "postSimSync");

  return null;
}
