// flow.effects.ts
export type FlowEffect =
  | { type: "notice"; title: string; detail?: string }
  | { type: "damagePlayer"; amount: number; cause?: string }
  | { type: "destroyPlayer"; cause: string }
  | { type: "damageSquad"; squadId: string; amount: number } // 0..1 fraction of health
  | { type: "setFlag"; key: string; value: boolean | number | string }
  | { type: "failMission"; reason: string }
  | { type: "goto"; stepId: string }; // later: story branching