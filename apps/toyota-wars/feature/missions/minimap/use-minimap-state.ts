"use client";

import { useRef } from "react";
import { useArena } from "@/context/arena-context";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useRadar } from "@/context/radar-context";
import { useTargets } from "@/context/targets-context";
import { useMission } from "@/context/missions.context";
import type { MinimapState } from "./types";

/**
 * Reads the five contexts the minimap depends on and keeps a per-frame
 * snapshot in a ref so the draw loop never closes over stale values.
 */
export function useMinimapState() {
  const arena = useArena();
  const { playerBody } = usePlayer();
  const { allyTargets, enemies } = useTargets();
  const { health } = useCombat();
  const { radarOnline } = useRadar();
  const { activeObjective, objectives } = useMission();

  const stateRef = useRef<MinimapState>({
    objective: activeObjective,
    playerBody,
    allyTargets,
    enemies,
    enemiesVisible: radarOnline,
    health,
    arena,
  });
  stateRef.current = {
    objective: activeObjective,
    playerBody,
    allyTargets,
    enemies,
    enemiesVisible: radarOnline,
    health,
    arena,
  };

  return { stateRef, activeObjective, objectives };
}
