"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import {
  UnitRegistry,
  type Unit,
  type UnitDef,
} from "@/lib/squad/squad.registry";
import type { ProjectileSystemHandle } from "@/lib/combat/combat.types";
import { WreckRegistry } from "@/lib/combat/wreck.registry";
import { useCombat } from "@/context/combat-context";
import { clearMissionUnitPositions } from "@toyota/missions";
import { clearDamageWarnings } from "@/lib/combat/damage-warnings";

interface Battle {
  registry: UnitRegistry;
  wrecks: WreckRegistry;
  /** Scene-level projectile pool handle. Null until <ProjectileSystem> mounts. */
  projectiles: RefObject<ProjectileSystemHandle | null>;
}

const BattleCtx = createContext<Battle | null>(null);

/** Must be rendered INSIDE <Canvas>: r3f is a separate React root, so outside context doesn't cross. */
export function BattleProvider({ children }: { children: ReactNode }) {
  const projectilesRef = useRef<ProjectileSystemHandle | null>(null);
  const [battle] = useState<Battle>(() => ({
    registry: new UnitRegistry(),
    wrecks: new WreckRegistry(),
    projectiles: projectilesRef,
  }));

  // Dev only: window.__battle.registry.debugSnapshot()
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __battle?: Battle };
    w.__battle = battle;
    return () => {
      delete w.__battle;
    };
  }, [battle]);

  return <BattleCtx.Provider value={battle}>{children}</BattleCtx.Provider>;
}

export function useBattle(): Battle {
  const b = useContext(BattleCtx);
  if (!b) throw new Error("useBattle must be used inside <BattleProvider>");
  return b;
}

/** Registers a unit for as long as the calling component is mounted. */
export function useRegisterUnit(def: UnitDef, enabled = true) {
  const { registry } = useBattle();
  const { id, team, kind, radius, ai, loadout, body, nudge } = def;
  // Compare loadout by value: callers may pass a fresh object every render.
  const loadoutModel = loadout?.model;
  const loadoutPlatform = loadout?.platform;
  const loadoutWeapon = loadout?.weapon;
  useEffect(() => {
    if (!enabled) return;
    return registry.register({
      id,
      team,
      kind,
      radius,
      ai,
      loadout:
        loadoutModel !== undefined &&
        loadoutPlatform !== undefined &&
        loadoutWeapon !== undefined
          ? {
              model: loadoutModel,
              platform: loadoutPlatform,
              weapon: loadoutWeapon,
            }
          : undefined,
      body,
      nudge,
    });
  }, [
    registry,
    id,
    team,
    kind,
    radius,
    ai,
    loadoutModel,
    loadoutPlatform,
    loadoutWeapon,
    body,
    nudge,
    enabled,
  ]);
}

/** Re-renders when units join or leave. Not for per-frame data: read unit.position in useFrame. */
export function useUnits(): readonly Unit[] {
  const { registry } = useBattle();
  return useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );
}

/** The projectile pool handle. `.current` is null until <ProjectileSystem> mounts. */
export function useProjectileSystem(): RefObject<ProjectileSystemHandle | null> {
  return useBattle().projectiles;
}

/** Clears scene-owned battle artifacts when the roster is reset. */
export function BattleResetEffects() {
  const { resetEpoch } = useCombat();
  const { wrecks } = useBattle();
  const projectiles = useProjectileSystem();
  const previousEpoch = useRef(resetEpoch);

  useEffect(() => {
    if (previousEpoch.current === resetEpoch) return;
    previousEpoch.current = resetEpoch;
    wrecks.clear();
    projectiles.current?.clear();
    clearMissionUnitPositions();
    clearDamageWarnings();
  }, [resetEpoch, wrecks, projectiles]);

  return null;
}
