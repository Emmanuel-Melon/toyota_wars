"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { resetCombatActivity } from "@/lib/combat/combat.activity";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import type { VehiclePart } from "@/lib/combat/combat.teams";
import type { HealthMap, PartHealthMap, Team } from "@/lib/combat/combat.types";
import { createGameEventBus } from "@toyota/missions";
import type { EventBus } from "@toyota/missions";
import type { GameEvents } from "@toyota/missions";
import type {
  BattleRoster,
  RosterSquad,
  RosterUnit,
} from "@/lib/squad/squad.roster";
import type {
  AllyAttackOrder,
  FireDesignation,
  FireDesignationGroup,
  SquadDirective,
} from "@/lib/squad/squad.types";
import { ALLY_ATTACK_MODE, SQUAD_DIRECTIVE } from "@/lib/squad/squad.types";
import { SQUAD_CONFIG } from "@/lib/squad/squad.config";
import type { FormationType } from "@/lib/tactics/tactics.formation";
import { createSkirmishRoster } from "@/feature/vehciles/spawns";

export type CombatStatsState = {
  enemiesDestroyed: number;
  currentAmmo: number;
};

type PlayerAggroEntry = {
  score: number;
  expiresAt: number;
};

type CombatContextValue = {
  health: HealthMap;
  partHealth: PartHealthMap;
  stats: CombatStatsState;
  maxAmmo: number;
  allyDirective: SquadDirective;
  allyOrdersIssued: boolean;
  onAllyDirectiveChange: (directive: SquadDirective) => void;
  attackOrder: AllyAttackOrder | null;
  issueAllyAttack: (targetId?: string) => void;
  clearAllyAttackOrder: () => void;
  allyFormation: FormationType;
  onAllyFormationChange: (formation: FormationType) => void;
  fireDesignation: FireDesignation | null;
  designateFire: (
    group: FireDesignationGroup,
    point: { x: number; z: number },
    targetId?: string,
  ) => void;
  clearFireDesignation: () => void;
  onHit: (id: string, part: VehiclePart, damage: number) => void;
  onKill: (team: Team, id: string) => void;
  getHealth: (id: string) => number;
  recordPlayerDamage: (targetId: string, damage: number) => void;
  getPlayerAggro: (targetId: string) => number;
  setCurrentAmmo: (currentAmmo: number) => void;
  livingAllies: number;
  livingEnemies: number;
  winner: Team | null;
  roster: BattleRoster;
  events: EventBus<GameEvents>;
  units: readonly RosterUnit[];
  squads: readonly RosterSquad[];
  resetEpoch: number;
  resetBattle: () => void;
};

const CombatCtx = createContext<CombatContextValue | null>(null);

function countLiving(
  units: readonly RosterUnit[],
  health: HealthMap,
  team: Team,
): number {
  let count = 0;
  for (const unit of units) {
    if (unit.team !== team || unit.kind !== "tank") continue;
    if ((health[unit.id] ?? unit.maxHealth) > 0) count += 1;
  }
  return count;
}

export function CombatProvider({ children }: { children: ReactNode }) {
  const [roster] = useState<BattleRoster>(createSkirmishRoster);
  const [events] = useState<EventBus<GameEvents>>(createGameEventBus);
  const snapshot = useSyncExternalStore(
    roster.subscribe,
    roster.getSnapshot,
    roster.getSnapshot,
  );
  const { health, partHealth, units, squads, resetEpoch } = snapshot;
  const [stats, setStats] = useState<CombatStatsState>({
    enemiesDestroyed: 0,
    currentAmmo: COMBAT_CONFIG.MAX_AMMO,
  });
  const [allyDirective, setAllyDirective] = useState<SquadDirective>(
    SQUAD_DIRECTIVE.HOLD,
  );
  const [allyOrdersIssued, setAllyOrdersIssued] = useState(false);
  const [attackOrder, setAttackOrder] = useState<AllyAttackOrder | null>(null);
  const [allyFormation, setAllyFormation] = useState<FormationType>("wedge");
  const [fireDesignation, setFireDesignation] =
    useState<FireDesignation | null>(null);
  const fireDesignationId = useRef(0);
  const fireDesignationTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const killedIds = useRef(new Set<string>());
  const playerAggro = useRef(new Map<string, PlayerAggroEntry>());

  const clearFireDesignation = useCallback(() => {
    if (fireDesignationTimeout.current) {
      clearTimeout(fireDesignationTimeout.current);
      fireDesignationTimeout.current = null;
    }
    setFireDesignation(null);
  }, []);

  const clearAllyAttackOrder = useCallback(() => setAttackOrder(null), []);

  const issueAllyAttack = useCallback((targetId?: string) => {
    setAllyDirective(SQUAD_DIRECTIVE.ADVANCE);
    setAllyOrdersIssued(true);
    setAttackOrder({
      mode: targetId ? ALLY_ATTACK_MODE.FOCUS : ALLY_ATTACK_MODE.SEEK,
      targetId,
      issuedAt: performance.now(),
    });
  }, []);

  const designateFire = useCallback(
    (
      group: FireDesignationGroup,
      point: { x: number; z: number },
      targetId?: string,
    ) => {
      if (fireDesignationTimeout.current) {
        clearTimeout(fireDesignationTimeout.current);
      }
      fireDesignationId.current += 1;
      const designation: FireDesignation = {
        id: fireDesignationId.current,
        point: { ...point },
        targetId,
        group,
        expiresAt: performance.now() + SQUAD_CONFIG.designateDurationMs,
      };
      fireDesignationTimeout.current = setTimeout(() => {
        fireDesignationTimeout.current = null;
        setFireDesignation(null);
      }, SQUAD_CONFIG.designateDurationMs);
      setFireDesignation(designation);
    },
    [],
  );

  const getHealth = useCallback((id: string) => roster.getHealth(id), [roster]);

  const recordPlayerDamage = useCallback((targetId: string, damage: number) => {
    const now = performance.now();
    const previous = playerAggro.current.get(targetId);
    const score =
      (previous && previous.expiresAt > now ? previous.score : 0) + damage;
    playerAggro.current.set(targetId, {
      score,
      expiresAt: now + COMBAT_CONFIG.PLAYER_AGGRO_DURATION_MS,
    });
  }, []);

  const getPlayerAggro = useCallback((targetId: string) => {
    const entry = playerAggro.current.get(targetId);
    if (!entry) return 0;
    if (entry.expiresAt <= performance.now()) {
      playerAggro.current.delete(targetId);
      return 0;
    }
    return entry.score;
  }, []);

  const handleHit = useCallback(
    (id: string, part: VehiclePart, damage: number) => {
      if (roster.getHealth(id) <= 0) return;
      roster.damageUnit(id, part, damage);
    },
    [roster],
  );

  const handleKill = useCallback(
    (team: Team, id: string) => {
      if (killedIds.current.has(id)) return;
      const unit = roster.getUnit(id);
      if (!unit) return;

      killedIds.current.add(id);
      roster.killUnit(id);
      if (fireDesignation?.targetId === id) clearFireDesignation();
      setAttackOrder((order) =>
        order?.mode === ALLY_ATTACK_MODE.FOCUS && order.targetId === id
          ? { mode: ALLY_ATTACK_MODE.SEEK, issuedAt: performance.now() }
          : order,
      );

      if (team === "ally" && unit.team === "enemy") {
        setStats((prev) => ({
          ...prev,
          enemiesDestroyed: prev.enemiesDestroyed + 1,
        }));
      }

      if (unit.kind === "player") {
        events.emit("playerDestroyed", {});
      } else {
        events.emit("unitDestroyed", {
          unitId: id,
          killerTeam: team,
          victimTeam: unit.team,
        });
      }
    },
    [clearFireDesignation, events, fireDesignation, roster],
  );

  const resetBattle = useCallback(() => {
    resetCombatActivity();
    roster.clear();
    killedIds.current.clear();
    playerAggro.current.clear();
    setStats({
      enemiesDestroyed: 0,
      currentAmmo: COMBAT_CONFIG.MAX_AMMO,
    });
    setAllyDirective(SQUAD_DIRECTIVE.HOLD);
    setAllyOrdersIssued(false);
    setAttackOrder(null);
    clearFireDesignation();
  }, [clearFireDesignation, roster]);

  const setCurrentAmmo = useCallback((currentAmmo: number) => {
    setStats((prev) =>
      prev.currentAmmo === currentAmmo ? prev : { ...prev, currentAmmo },
    );
  }, []);

  const handleAllyDirectiveChange = useCallback((directive: SquadDirective) => {
    setAllyDirective(directive);
    setAllyOrdersIssued(true);
    if (directive !== SQUAD_DIRECTIVE.ADVANCE) setAttackOrder(null);
  }, []);
  const handleAllyFormationChange = useCallback(
    (formation: FormationType) => setAllyFormation(formation),
    [],
  );

  const { livingAllies, livingEnemies, winner } = useMemo(() => {
    const allies = countLiving(units, health, "ally");
    const enemies = countLiving(units, health, "enemy");

    return {
      livingAllies: allies,
      livingEnemies: enemies,
      winner:
        enemies === 0
          ? ("ally" as const)
          : allies === 0
            ? ("enemy" as const)
            : null,
    };
  }, [units, health]);

  const value = useMemo<CombatContextValue>(
    () => ({
      health,
      partHealth,
      stats,
      maxAmmo: COMBAT_CONFIG.MAX_AMMO,
      allyDirective,
      allyOrdersIssued,
      onAllyDirectiveChange: handleAllyDirectiveChange,
      attackOrder,
      issueAllyAttack,
      clearAllyAttackOrder,
      allyFormation,
      onAllyFormationChange: handleAllyFormationChange,
      fireDesignation,
      designateFire,
      clearFireDesignation,
      onHit: handleHit,
      onKill: handleKill,
      getHealth,
      recordPlayerDamage,
      getPlayerAggro,
      setCurrentAmmo,
      livingAllies,
      livingEnemies,
      winner,
      roster,
      events,
      units,
      squads,
      resetEpoch,
      resetBattle,
    }),
    [
      health,
      partHealth,
      stats,
      allyDirective,
      allyOrdersIssued,
      attackOrder,
      issueAllyAttack,
      clearAllyAttackOrder,
      allyFormation,
      fireDesignation,
      designateFire,
      clearFireDesignation,
      handleAllyDirectiveChange,
      handleAllyFormationChange,
      handleHit,
      handleKill,
      getHealth,
      recordPlayerDamage,
      getPlayerAggro,
      setCurrentAmmo,
      livingAllies,
      livingEnemies,
      winner,
      roster,
      events,
      units,
      squads,
      resetEpoch,
      resetBattle,
    ],
  );

  return <CombatCtx.Provider value={value}>{children}</CombatCtx.Provider>;
}

export function useCombat(): CombatContextValue {
  const ctx = useContext(CombatCtx);
  if (!ctx) throw new Error("useCombat must be used inside CombatProvider");
  return ctx;
}
