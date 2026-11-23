import { NodeState } from "@toyota/ai";
import { describe, expect, it } from "vitest";
import {
  AgentIntent,
  AgentMovementOrders,
  AgentWeaponOrders,
  buildUtilityAgentTree,
} from "../index";
import { createTestContext, testConfig } from "../testing/context";

describe("buildUtilityAgentTree", () => {
  it("runs a forced intent subtree", () => {
    const tree = buildUtilityAgentTree(testConfig);
    const ctx = createTestContext({
      targetPosition: { x: 0, y: 0, z: 10 },
      hasAssignedTarget: true,
      targetDistance: 10,
      squadOrder: {
        ...createTestContext().squadOrder,
        forcedIntent: AgentIntent.Attack,
      },
    });

    expect(tree.evaluate(ctx)).toBe(NodeState.RUNNING);
    expect(ctx.decision.movement).toEqual({
      type: AgentMovementOrders.Flee,
      threats: [{ position: { x: 0, y: 0, z: 10 } }],
      speed: testConfig.fleeSpeed,
    });
    expect(ctx.decision.weapon).toEqual({
      type: AgentWeaponOrders.FireAt,
      point: { x: 0, y: 0, z: 10 },
      requireAlignment: false,
    });
  });
});
