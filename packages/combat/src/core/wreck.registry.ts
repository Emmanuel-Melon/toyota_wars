import * as THREE from "three";
import type { Team } from "./combat.types";

export const WRECK_LOOT = {
  AMMO: "ammo",
  HEALTH: "health",
} as const;

export type WreckLootType = (typeof WRECK_LOOT)[keyof typeof WRECK_LOOT];

export interface WreckLoot {
  type: WreckLootType;
  amount: number;
}

export type Wreck = {
  id: string;
  team: Team;
  position: THREE.Vector3;
  loot: WreckLoot | null;
  collected: boolean;
};

const EMPTY_WRECKS: readonly Wreck[] = [];

export class WreckRegistry {
  private wrecks = new Map<string, Wreck>();
  private listeners = new Set<() => void>();
  private snapshot: readonly Wreck[] = EMPTY_WRECKS;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  register(wreck: Omit<Wreck, "collected">): void {
    if (this.wrecks.has(wreck.id)) return;

    this.wrecks.set(wreck.id, {
      ...wreck,
      position: wreck.position.clone(),
      loot: wreck.loot ? { ...wreck.loot } : null,
      collected: wreck.loot === null || wreck.loot.amount <= 0,
    });
    this.publish();
  }

  findNear(
    position: Readonly<THREE.Vector3>,
    radius: number,
    team: Team,
    accept?: (wreck: Wreck) => boolean,
  ): Wreck | null {
    let closest: Wreck | null = null;
    let closestDistanceSq = radius * radius;

    for (const wreck of this.wrecks.values()) {
      if (wreck.collected || wreck.team !== team) continue;
      if (accept && !accept(wreck)) continue;

      const dx = wreck.position.x - position.x;
      const dz = wreck.position.z - position.z;
      const distanceSq = dx * dx + dz * dz;
      if (distanceSq > closestDistanceSq) continue;

      closest = wreck;
      closestDistanceSq = distanceSq;
    }

    return closest;
  }

  collect(wreck: Wreck): void {
    if (wreck.collected) return;
    wreck.collected = true;
    this.publish();
  }

  clear(): void {
    if (this.wrecks.size === 0) return;
    this.wrecks.clear();
    this.publish();
  }

  private publish(): void {
    this.snapshot = [...this.wrecks.values()];
    this.listeners.forEach((listener) => listener());
  }
}
