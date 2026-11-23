"use client";

import {
  createContext,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { TANK_HIT_PARTS } from "@/lib/combat/combat.hitboxes";
import type { EnemyTarget, HealthMap, Team } from "@/lib/combat/combat.types";
import type { TerrainSampler } from "@/lib/map/map.terrain";
import type { RosterUnit } from "@/lib/squad/squad.roster";
import { useCombat } from "./combat-context";
import { useArena } from "./arena-context";

function makeTarget(
  id: string,
  team: Team,
  x: number,
  z: number,
  heading: number,
  terrain: TerrainSampler,
): EnemyTarget {
  return {
    id,
    team,
    heading,
    position: [x, terrain.getVehicleHeight(x, z), z],
    parts: TANK_HIT_PARTS,
  };
}

function rosterTargets(
  units: readonly RosterUnit[],
  team: Team,
  terrain: TerrainSampler,
  health: HealthMap,
): EnemyTarget[] {
  const targets: EnemyTarget[] = [];
  for (const unit of units) {
    if (unit.team !== team || unit.kind !== "tank" || !unit.spawn) continue;
    if ((health[unit.id] ?? unit.maxHealth) <= 0) continue;
    targets.push(
      makeTarget(
        unit.id,
        unit.team,
        unit.spawn.position[0],
        unit.spawn.position[1],
        unit.spawn.rotationY,
        terrain,
      ),
    );
  }
  return targets;
}

type TargetsContextValue = {
  enemies: EnemyTarget[];
  allyTargets: EnemyTarget[];
  playerTarget: RefObject<EnemyTarget>;
  projectileTargets: RefObject<EnemyTarget[]>;
};

const TargetsCtx = createContext<TargetsContextValue | null>(null);

export function TargetsProvider({ children }: { children: ReactNode }) {
  const arena = useArena();
  const { units, health } = useCombat();
  const enemies = useMemo<EnemyTarget[]>(
    () => rosterTargets(units, "enemy", arena.terrain, health),
    [units, arena.terrain, health],
  );
  const allyTargets = useMemo<EnemyTarget[]>(
    () => rosterTargets(units, "ally", arena.terrain, health),
    [units, arena.terrain, health],
  );
  const playerTarget = useRef<EnemyTarget>({
    id: COMBAT_CONFIG.PLAYER_ID,
    team: "ally",
    heading: arena.playerHeading,
    position: [
      arena.playerSpawn[0],
      arena.terrain.getVehicleHeight(
        arena.playerSpawn[0],
        arena.playerSpawn[1],
      ),
      arena.playerSpawn[1],
    ],
    parts: TANK_HIT_PARTS,
  });

  const projectileTargets = useMemo<EnemyTarget[]>(
    () => [...enemies, ...allyTargets, playerTarget.current],
    [enemies, allyTargets],
  );
  const projectileTargetsRef = useRef<EnemyTarget[]>(projectileTargets);
  projectileTargetsRef.current = projectileTargets;

  const value = useMemo<TargetsContextValue>(
    () => ({
      enemies,
      allyTargets,
      playerTarget,
      projectileTargets: projectileTargetsRef,
    }),
    [enemies, allyTargets],
  );

  return <TargetsCtx.Provider value={value}>{children}</TargetsCtx.Provider>;
}

export function useTargets(): TargetsContextValue {
  const ctx = useContext(TargetsCtx);
  if (!ctx) throw new Error("useTargets must be used inside TargetsProvider");
  return ctx;
}
