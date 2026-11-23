import { describe, expect, it } from "vitest";
import {
  AgentIntent,
  buildAgentTree,
  createAgentIntentRegistry,
} from "../index";
import { testConfig } from "../testing/context";

describe("createAgentIntentRegistry", () => {
  const registry = createAgentIntentRegistry(testConfig);

  it("registers every intent exactly once", () => {
    expect(Object.keys(registry.intents)).toHaveLength(7);
    expect(registry.allIntents.map((intent) => intent.id)).toEqual(
      Object.values(AgentIntent),
    );
  });

  it("builds every intent tree", () => {
    for (const intent of registry.allIntents) {
      expect(() => buildAgentTree(intent.tree)).not.toThrow();
    }
  });

  it("flattens options in intent order", () => {
    expect(registry.agentOptions.map((option) => option.id)).toEqual([
      AgentIntent.Attack,
      AgentIntent.Pin,
      AgentIntent.Retreat,
      AgentIntent.Flank,
      AgentIntent.LoSReposition,
      AgentIntent.FollowLeader,
      AgentIntent.FollowLeader,
      AgentIntent.Patrol,
    ]);
  });
});
