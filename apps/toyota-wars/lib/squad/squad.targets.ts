// apps/toyota-wars/lib/squad/squad.targets.ts
import type { Vector3 } from "three";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import type {
  HealthMap,
  PotentialTarget,
  TargetAllocationMap,
} from "@/lib/combat/combat.types";
import { selectBestTarget } from "@/lib/combat/combat.targets";

export type TargetAllocationOptions = {
  priorityTargetId?: string;
  priorityMemberIds?: ReadonlySet<string>;
};

/**
 * Sticky squad target allocator. Each member keeps its current target until
 * that target dies, then picks the best available target with an
 * overcrowding penalty so squads spread fire instead of focusing one unit.
 */
export function createTargetAllocator() {
  let allocations: TargetAllocationMap = {};

  return (
    members: { id: string; position: Vector3 }[],
    targets: PotentialTarget[],
    healthMap: HealthMap,
    options: TargetAllocationOptions = {},
  ): Record<string, string | undefined> => {
    const previous = allocations;
    allocations = {};

    for (const member of members) {
      const priorityTarget =
        options.priorityTargetId && options.priorityMemberIds?.has(member.id)
          ? targets.find((target) => target.id === options.priorityTargetId)
          : undefined;
      if (
        priorityTarget &&
        (healthMap[priorityTarget.id] ?? COMBAT_CONFIG.MAX_HEALTH) > 0
      ) {
        allocations[member.id] = priorityTarget.id;
        continue;
      }

      const previousId = previous[member.id];
      const previousTarget = previousId
        ? targets.find((target) => target.id === previousId)
        : undefined;
      const previousAlive =
        previousTarget !== undefined &&
        (healthMap[previousTarget.id] ?? COMBAT_CONFIG.MAX_HEALTH) > 0;
      const alreadyClaimed = Object.values(allocations).includes(
        previousTarget?.id ?? "",
      );

      // Stay locked on the current target until it is destroyed.
      if (previousTarget && previousAlive && !alreadyClaimed) {
        allocations[member.id] = previousTarget.id;
        continue;
      }

      const best = selectBestTarget(
        member.id,
        member.position,
        targets,
        healthMap,
        allocations,
      );
      if (best) {
        allocations[member.id] = best.id;
      }
    }

    return allocations;
  };
}
