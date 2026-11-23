export const AgentNodes = {
  CheckTargetAssigned: "check-target-assigned",
  CheckHasLeader: "check-has-leader",
  CheckTargetInRange: "check-target-in-range",
  CheckAligned: "check-aligned",
  Chase: "chase-with-avoidance",
  Shoot: "shoot-target",
  StandoffCombat: "standoff-combat",
  FormationFire: "formation-fire",
  Flank: "flank",
  LoSReposition: "los-reposition",
  PinCover: "pin-cover",
  Patrol: "patrol",
  Flee: "flee",
  CheckLeaderBeyond: "check-leader-beyond",
  CheckRetreating: "check-retreating",
  CheckRouted: "check-routed",
  AimAtTarget: "aim-at-target",
  FollowLeader: "follow-leader",
  Idle: "idle",
} as const;

export type AgentNodeId = (typeof AgentNodes)[keyof typeof AgentNodes];
