"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useCombat } from "@/context/combat-context";
import { RADAR_UNIT_ID } from "@/lib/missions/data/radar";

export type RadarContextValue = {
  radarOnline: boolean;
  radarUnitId: string;
};

const RadarContext = createContext<RadarContextValue | null>(null);

export function RadarProvider({ children }: { children: ReactNode }) {
  const { units, health } = useCombat();
  const radarUnit = units.find((unit) => unit.id === RADAR_UNIT_ID);
  const radarHealth = radarUnit
    ? (health[RADAR_UNIT_ID] ?? radarUnit.maxHealth)
    : 0;
  const radarOnline = !radarUnit || radarHealth > 0;

  const value = useMemo<RadarContextValue>(
    () => ({ radarOnline, radarUnitId: RADAR_UNIT_ID }),
    [radarOnline],
  );

  return (
    <RadarContext.Provider value={value}>{children}</RadarContext.Provider>
  );
}

export function useRadar(): RadarContextValue {
  const ctx = useContext(RadarContext);
  if (!ctx) throw new Error("useRadar must be used within <RadarProvider>");
  return ctx;
}
