import type { HealthMap, Team } from "@/lib/combat/combat.types";
import type { UnitRegistry } from "./squad.registry";
import {
  FIRE_DESIGNATION_GROUP,
  type FireDesignation,
  type SquadOrderContext,
} from "./squad.types";
import type { VehicleLoadout } from "../vehicles/vehicle.types";
import { SQUAD_CONFIG } from "./squad.config";
import type { TankIntent } from "../utility/utility.types";

type ApplyFireDesignationParams = {
  designation: FireDesignation | null | undefined;
  team: Team;
  units: readonly { id: string; maxHealth: number }[];
  health: HealthMap;
  loadouts: Readonly<Record<string, VehicleLoadout | undefined>>;
  registry: UnitRegistry;
  orders: Map<string, SquadOrderContext>;
  leaderPosition?: { x: number; z: number } | null;
  attackIntent: TankIntent;
};

export function applyFireDesignation({
  designation,
  team,
  units,
  health,
  loadouts,
  registry,
  orders,
  leaderPosition,
  attackIntent,
}: ApplyFireDesignationParams): void {
  if (!designation || team !== "ally") return;
  if (designation.expiresAt <= performance.now()) return;

  const nearbyRadiusSq = SQUAD_CONFIG.designateNearbyRadius ** 2;

  for (const unit of units) {
    if ((health[unit.id] ?? unit.maxHealth) <= 0) continue;
    const order = orders.get(unit.id);
    if (!order) continue;

    const weaponId = loadouts[unit.id]?.weapon;
    if (
      designation.group === FIRE_DESIGNATION_GROUP.TYPE63 &&
      weaponId !== "type63"
    )
      continue;
    if (
      designation.group === FIRE_DESIGNATION_GROUP.ZU23 &&
      weaponId !== "zu23"
    )
      continue;
    if (designation.group === FIRE_DESIGNATION_GROUP.NEARBY) {
      const pos = registry.get(unit.id)?.position;
      if (!leaderPosition || !pos) continue;
      const dx = pos.x - leaderPosition.x;
      const dz = pos.z - leaderPosition.z;
      if (dx * dx + dz * dz > nearbyRadiusSq) continue;
    }

    order.fireDesignation = designation;
    order.forcedIntent = attackIntent;
  }
}
