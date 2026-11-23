import { ENEMY_TACTICAL_ROLES, type SquadOrderContext } from "./squad.types";
import type { TankIntent } from "../utility/utility.types";
import type { SquadSituational } from "./squad.situational";

/**
 * Applies post-orchestrator overrides: retreating units flee, aggro'd units
 * attack. Kept separate because it runs AFTER directive assignment.
 */
export function applyForcedIntents(
  orders: Map<string, SquadOrderContext>,
  situational: Pick<SquadSituational, "priorityMemberIds" | "retreatMemberIds">,
  intent: { retreat: TankIntent; attack: TankIntent },
): void {
  for (const [id, order] of orders) {
    const roleManaged =
      order.tactical != null &&
      ENEMY_TACTICAL_ROLES.includes(order.tactical.role);
    if (situational.retreatMemberIds.has(id) && order.retreatAllowed) {
      order.forcedIntent = intent.retreat;
    } else if (situational.priorityMemberIds.has(id) && !roleManaged) {
      order.forcedIntent = intent.attack;
    } else if (roleManaged) {
      order.forcedIntent = undefined;
    }
  }
}
