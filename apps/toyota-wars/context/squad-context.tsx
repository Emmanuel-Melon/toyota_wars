// feature/context/squad-context.tsx
"use client";

import { createContext, useContext, type RefObject } from "react";
import type * as THREE from "three";
import type { Obstacle } from "@/lib/movement/movement.types";
import type { Team } from "@toyota/combat";
import type { SquadOrderContext } from "@/lib/squad/squad.types";

type SquadContextValue = {
  team: Team;
  obstacles: readonly Obstacle[];
  targetPositionsRef?: RefObject<Map<string, THREE.Vector3>> | null;
  squadOrdersRef?: RefObject<Map<string, SquadOrderContext>> | null;
  retreatOnDamage: boolean;
  attackMode: boolean;
};

const SquadContext = createContext<SquadContextValue | null>(null);

export const SquadProvider = SquadContext.Provider;

export function useSquadContext() {
  const context = useContext(SquadContext);
  if (!context) {
    throw new Error("useSquadContext must be used within a SquadProvider");
  }
  return context;
}
