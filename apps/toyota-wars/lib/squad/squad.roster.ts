// apps/toyota-wars/lib/squad/squad.roster.ts
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import { partMaxHealth, VEHICLE_PARTS } from "@/lib/combat/combat.parts";
import { partId, type VehiclePart } from "@/lib/combat/combat.teams";
import type { HealthMap, PartHealthMap, Team } from "@/lib/combat/combat.types";
import type { VehicleSpawn } from "@/lib/map/map.types";
import type {
  InitialOrder,
  Personality,
  SquadFireMode,
} from "@toyota/missions";
import {
  UNIT_TEMPLATES,
  type UnitTemplateId,
} from "@/lib/missions/data/templates";
import type { FormationType } from "@/lib/tactics/tactics.formation";
import { pickFactionPalette } from "@/lib/vehicle-identity";
import type { UnitKind } from "./squad.registry";

const EMPTY_UNITS: readonly RosterUnit[] = [];
const EMPTY_SQUADS: readonly RosterSquad[] = [];

export type RosterUnitSpawn = {
  template: UnitTemplateId;
  spawn: VehicleSpawn;
  maxHealth?: number;
  isLeader?: boolean;
};

export type RosterSquadSpawn = {
  id: string;
  team: Team;
  units: readonly RosterUnitSpawn[];
  initialOrder?: InitialOrder;
  personality?: Personality;
  formationType?: FormationType;
  formationSpacing?: number;
  holdFormation?: boolean;
  fireMode?: SquadFireMode;
};

export type RosterUnit = {
  id: string;
  squadId: string;
  team: Team;
  index: number;
  kind: UnitKind;
  template: UnitTemplateId | null;
  isLeader: boolean;
  maxHealth: number;
  spawn: VehicleSpawn | null;
};

export type RosterSquad = {
  id: string;
  team: Team;
  leaderId: string | null;
  unitIds: readonly string[];
  initialOrder: InitialOrder;
  personality: Personality;
  formationType: FormationType;
  formationSpacing: number;
  holdFormation: boolean;
  fireMode: SquadFireMode;
};

export type RosterSnapshot = {
  units: readonly RosterUnit[];
  squads: readonly RosterSquad[];
  health: HealthMap;
  partHealth: PartHealthMap;
  resetEpoch: number;
};

export function rosterUnitId(
  team: Team,
  squadId: string,
  index: number,
): string {
  return `${team}-${squadId}-${index}`;
}

export class BattleRoster {
  private units = new Map<string, RosterUnit>();
  private squads = new Map<string, RosterSquad>();
  private unitList: readonly RosterUnit[] = EMPTY_UNITS;
  private squadList: readonly RosterSquad[] = EMPTY_SQUADS;
  private health: HealthMap = {};
  private partHealth: PartHealthMap = {};
  private resetEpoch = 0;
  private listeners = new Set<() => void>();
  private snapshot: RosterSnapshot = {
    units: EMPTY_UNITS,
    squads: EMPTY_SQUADS,
    health: this.health,
    partHealth: this.partHealth,
    resetEpoch: this.resetEpoch,
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  getUnit(id: string): RosterUnit | undefined {
    return this.units.get(id);
  }

  getSquad(id: string): RosterSquad | undefined {
    return this.squads.get(id);
  }

  getHealth(id: string): number {
    const unit = this.units.get(id);
    return this.health[id] ?? unit?.maxHealth ?? COMBAT_CONFIG.MAX_HEALTH;
  }

  getPartHealth(id: string, part: VehiclePart): number {
    const unit = this.units.get(id);
    const maxHealth = unit?.maxHealth ?? COMBAT_CONFIG.MAX_HEALTH;
    return this.partHealth[partId(id, part)] ?? partMaxHealth(part, maxHealth);
  }

  registerPlayer(
    id: string = COMBAT_CONFIG.PLAYER_ID,
    maxHealth: number = COMBAT_CONFIG.MAX_HEALTH,
  ): RosterUnit {
    const existing = this.units.get(id);
    if (existing) return existing;

    const unit: RosterUnit = {
      id,
      squadId: "player",
      team: "ally",
      index: 0,
      kind: "player",
      template: null,
      isLeader: false,
      maxHealth,
      spawn: null,
    };

    this.units.set(id, unit);
    this.health = { ...this.health, [id]: maxHealth };
    this.partHealth = this.withInitialParts(this.partHealth, id, maxHealth);
    this.rebuildLists();
    return unit;
  }

  addSquad(spawn: RosterSquadSpawn): RosterUnit[] {
    if (this.squads.has(spawn.id)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[BattleRoster] duplicate squad id "${spawn.id}"`);
      }
      return [];
    }

    const added: RosterUnit[] = [];
    const unitIds: string[] = [];
    let leaderId: string | null = null;

    spawn.units.forEach((input, index) => {
      const id = rosterUnitId(spawn.team, spawn.id, index);
      if (this.units.has(id)) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[BattleRoster] duplicate unit id "${id}"`);
        }
        return;
      }

      const maxHealth =
        input.maxHealth ??
        UNIT_TEMPLATES[input.template]?.maxHealth ??
        COMBAT_CONFIG.MAX_HEALTH;
      const unit: RosterUnit = {
        id,
        squadId: spawn.id,
        team: spawn.team,
        index,
        kind: "tank",
        template: input.template,
        isLeader: input.isLeader ?? false,
        maxHealth,
        spawn: input.spawn
          ? {
              ...input.spawn,
              palette: pickFactionPalette(spawn.team, id),
            }
          : input.spawn,
      };

      this.units.set(id, unit);
      this.health = { ...this.health, [id]: maxHealth };
      this.partHealth = this.withInitialParts(this.partHealth, id, maxHealth);
      if (unit.isLeader && !leaderId) leaderId = id;
      added.push(unit);
      unitIds.push(id);
    });

    this.squads.set(spawn.id, {
      id: spawn.id,
      team: spawn.team,
      leaderId,
      unitIds,
      initialOrder: spawn.initialOrder ?? "attack",
      personality: spawn.personality ?? { aggression: 0.5, caution: 0.5 },
      formationType: spawn.formationType ?? "wedge",
      formationSpacing: spawn.formationSpacing ?? 8,
      holdFormation: spawn.holdFormation ?? false,
      fireMode: spawn.fireMode ?? "normal",
    });
    this.rebuildLists();
    return added;
  }

  removeUnit(id: string): void {
    const unit = this.units.get(id);
    if (!unit) return;

    this.units.delete(id);
    this.health = this.withoutKey(this.health, id);
    this.partHealth = VEHICLE_PARTS.reduce(
      (next, part) => this.withoutKey(next, partId(id, part)),
      this.partHealth,
    );

    const squad = this.squads.get(unit.squadId);
    if (squad) {
      const unitIds = squad.unitIds.filter((unitId) => unitId !== id);
      if (unitIds.length === 0) {
        this.squads.delete(squad.id);
      } else {
        this.squads.set(squad.id, {
          ...squad,
          unitIds,
          leaderId: squad.leaderId === id ? unitIds[0] : squad.leaderId,
        });
      }
    }

    this.rebuildLists();
  }

  removeSquad(id: string): void {
    const squad = this.squads.get(id);
    if (!squad) return;

    for (const unitId of squad.unitIds) {
      this.units.delete(unitId);
      this.health = this.withoutKey(this.health, unitId);
      this.partHealth = VEHICLE_PARTS.reduce(
        (next, part) => this.withoutKey(next, partId(unitId, part)),
        this.partHealth,
      );
    }
    this.squads.delete(id);
    this.rebuildLists();
  }

  damageUnit(
    id: string,
    part: VehiclePart,
    damage: number,
  ): { health: number; killed: boolean } {
    const unit = this.units.get(id);
    if (!unit) return { health: 0, killed: false };

    const previousHealth = this.health[id] ?? unit.maxHealth;
    const nextHealth = Math.max(0, previousHealth - damage);
    const partKey = partId(id, part);
    const previousPartHealth =
      this.partHealth[partKey] ?? partMaxHealth(part, unit.maxHealth);
    const nextPartHealth = Math.max(0, previousPartHealth - damage);

    if (
      nextHealth === previousHealth &&
      nextPartHealth === previousPartHealth
    ) {
      return { health: nextHealth, killed: false };
    }

    if (nextHealth !== previousHealth) {
      this.health = { ...this.health, [id]: nextHealth };
    }
    if (nextPartHealth !== previousPartHealth) {
      this.partHealth = { ...this.partHealth, [partKey]: nextPartHealth };
    }

    this.publish();
    return {
      health: nextHealth,
      killed: previousHealth > 0 && nextHealth === 0,
    };
  }

  healUnit(id: string, amount: number): number {
    const unit = this.units.get(id);
    if (!unit || amount <= 0) return 0;

    const previousHealth = this.health[id] ?? unit.maxHealth;
    const nextHealth = Math.min(unit.maxHealth, previousHealth + amount);
    let healed = nextHealth - previousHealth;
    let nextPartHealth = this.partHealth;
    let partsChanged = false;

    for (const part of VEHICLE_PARTS) {
      const key = partId(id, part);
      const previous =
        nextPartHealth[key] ?? partMaxHealth(part, unit.maxHealth);
      const next = Math.min(
        partMaxHealth(part, unit.maxHealth),
        previous + amount,
      );
      if (next === previous) continue;

      nextPartHealth = { ...nextPartHealth, [key]: next };
      partsChanged = true;
      healed = Math.max(healed, next - previous);
    }

    if (healed === 0 && !partsChanged) return 0;

    if (nextHealth !== previousHealth) {
      this.health = { ...this.health, [id]: nextHealth };
    }
    if (partsChanged) {
      this.partHealth = nextPartHealth;
    }

    this.publish();
    return healed;
  }

  killUnit(id: string): boolean {
    const unit = this.units.get(id);
    if (!unit) return false;

    const previousHealth = this.health[id] ?? unit.maxHealth;
    if (previousHealth <= 0) return false;

    this.health = { ...this.health, [id]: 0 };
    this.publish();
    return true;
  }

  clear(): void {
    this.units.clear();
    this.squads.clear();
    this.health = {};
    this.partHealth = {};
    this.unitList = EMPTY_UNITS;
    this.squadList = EMPTY_SQUADS;
    this.resetEpoch += 1;
    this.publish();
  }

  private withInitialParts(
    health: PartHealthMap,
    id: string,
    maxHealth: number,
  ): PartHealthMap {
    const next = { ...health };
    for (const part of VEHICLE_PARTS) {
      next[partId(id, part)] = partMaxHealth(part, maxHealth);
    }
    return next;
  }

  private withoutKey<T extends Record<string, number>>(
    record: T,
    key: string,
  ): T {
    if (!(key in record)) return record;
    const next = { ...record };
    delete next[key];
    return next;
  }

  private rebuildLists(): void {
    this.unitList = [...this.units.values()];
    this.squadList = [...this.squads.values()];
    this.publish();
  }

  private publish(): void {
    this.snapshot = {
      units: this.unitList,
      squads: this.squadList,
      health: this.health,
      partHealth: this.partHealth,
      resetEpoch: this.resetEpoch,
    };
    this.listeners.forEach((listener) => listener());
  }
}
