import { NodeState } from "@toyota/ai";
import { describe, expect, it } from "vitest";
import {
  AgentMovementOrders,
  AgentNodes,
  AgentWeaponOrders,
  buildAgentTree,
  type AgentTreeDef,
} from "../index";
import { createTestContext } from "../testing/context";

describe("buildAgentTree", () => {
  it("builds every registered node id", () => {
    for (const id of Object.values(AgentNodes)) {
      const def = {
        type: id,
        params:
          id === AgentNodes.CheckLeaderBeyond ? { distance: 10 } : undefined,
      } as AgentTreeDef;
      expect(() => buildAgentTree(def)).not.toThrow();
    }
  });

  it("runs selector fallback to idle", () => {
    const tree = buildAgentTree({
      type: "selector",
      children: [
        { type: AgentNodes.CheckHasLeader },
        { type: AgentNodes.Idle },
      ],
    });
    const ctx = createTestContext();

    expect(tree.evaluate(ctx)).toBe(NodeState.RUNNING);
    expect(ctx.decision.movement).toEqual({
      type: AgentMovementOrders.Idle,
    });
    expect(ctx.decision.weapon).toEqual({
      type: AgentWeaponOrders.Hold,
    });
  });

  it("stops a sequence on a failed guard", () => {
    const tree = buildAgentTree({
      type: "sequence",
      children: [
        { type: AgentNodes.CheckTargetAssigned },
        { type: AgentNodes.Idle },
      ],
    });
    const ctx = createTestContext();

    expect(tree.evaluate(ctx)).toBe(NodeState.FAILURE);
    expect(ctx.decision.movement).toEqual({
      type: AgentMovementOrders.Idle,
    });
  });
});
