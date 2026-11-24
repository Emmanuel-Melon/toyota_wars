import type { AgentConfig } from "../agent.types";
import type { AgentIntentDef, AgentUtilityOption } from "./types";
import {
  createAttackIntent,
  createPinIntent,
  createRetreatIntent,
  createFlankIntent,
  createLosRepositionIntent,
  createFollowLeaderIntent,
  createPatrolIntent,
} from "./options";

export function createAgentIntentRegistry(config: AgentConfig) {
  const intents = {
    attack: createAttackIntent(config),
    pin: createPinIntent(config),
    retreat: createRetreatIntent(config),
    flank: createFlankIntent(config),
    losReposition: createLosRepositionIntent(config),
    followLeader: createFollowLeaderIntent(config),
    patrol: createPatrolIntent(config),
  };

  const allIntents = Object.values(intents) as AgentIntentDef[];
  const agentOptions = allIntents.flatMap(
    (intent) => intent.options,
  ) as AgentUtilityOption[];

  return { intents, allIntents, agentOptions };
}
