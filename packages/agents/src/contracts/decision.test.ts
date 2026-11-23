import { describe, expect, it } from "vitest";
import {
  AgentMovementOrders,
  AgentWeaponOrders,
  createAgentDecision,
  resetAgentDecision,
} from "../index";

describe("agent decisions", () => {
  it("starts idle with the weapon held", () => {
    expect(createAgentDecision()).toEqual({
      movement: { type: AgentMovementOrders.Idle },
      weapon: { type: AgentWeaponOrders.Hold },
    });
  });

  it("resets an existing decision", () => {
    const decision = createAgentDecision();
    decision.movement = {
      type: AgentMovementOrders.Face,
      point: { x: 1, y: 0, z: 2 },
    };
    decision.weapon = {
      type: AgentWeaponOrders.FireAt,
      point: { x: 1, y: 0, z: 2 },
    };

    resetAgentDecision(decision);

    expect(decision.movement).toEqual({ type: AgentMovementOrders.Idle });
    expect(decision.weapon).toEqual({ type: AgentWeaponOrders.Hold });
  });
});
