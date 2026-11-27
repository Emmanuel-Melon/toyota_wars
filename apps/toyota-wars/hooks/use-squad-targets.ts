import { useState } from "react";
import { useGameFrame } from "@/render-loop";
import * as THREE from "three";
import { createTargetAllocator } from "@/lib/squad/squad.targets";
import {
  NO_TARGET_Z,
  opposingTeam,
  type HealthMap,
  type Team,
} from "@toyota/combat";
import { useBattle } from "@/context/battle-context";

export function useSquadTargets(
  team: Team,
  unitIds: readonly string[],
  health: HealthMap,
): readonly THREE.Vector3[] {
  const { registry } = useBattle();
  const [allocateTargets] = useState(() => createTargetAllocator());
  const [targets] = useState(() =>
    unitIds.map(() => new THREE.Vector3(0, 0, NO_TARGET_Z)),
  );

  // Runs before vehicles think so they read this frame's targets.
  useGameFrame(() => {
    const members = unitIds.flatMap((id) => {
      const unit = registry.get(id);
      return unit ? [{ id, position: unit.position }] : [];
    });
    const foes = registry
      .byTeam(opposingTeam(team))
      .map((u) => ({ id: u.id, position: u.position }));

    const allocations = allocateTargets(members, foes, health);

    unitIds.forEach((id, i) => {
      const targetId = allocations[id];
      const unit = targetId ? registry.get(targetId) : undefined;
      if (unit) targets[i].copy(unit.position);
      else targets[i].set(0, 0, NO_TARGET_Z);
    });
  }, "squadTargets");

  return targets;
}
