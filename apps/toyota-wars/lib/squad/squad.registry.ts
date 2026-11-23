// apps/toyota-wars/lib/squad/squad.registry.ts
import type { Team } from "@/lib/combat/combat.types";
import type { VehicleState } from "@/lib/movement/movement.types";
import type { VehicleLoadout } from "@/lib/vehicles/vehicle.types";

export type UnitKind = "tank" | "player";

/** Live state, mutated in place by its owner. Everyone else treats it as read-only. */
export type UnitBody = Pick<VehicleState, "position" | "heading" | "speed">;

export interface UnitDef {
  id: string;
  team: Team;
  kind: UnitKind;
  radius: number;
  /** false = human-controlled: targetable, but not an AI squad member */
  ai: boolean;
  /** Platform + weapon used by the squad macro-layer for sub-group assignment. */
  loadout?: VehicleLoadout;
  body: UnitBody;
  /** Applies a horizontal correction (collision separation) to the owner. */
  nudge?: (dx: number, dz: number) => void;
}

export interface Unit extends UnitDef {
  /** Alias of body.position so a Unit can pass as { id, position }. */
  readonly position: UnitBody["position"];
}

const EMPTY: readonly Unit[] = [];

export class UnitRegistry {
  private units = new Map<string, Unit>();
  private list: readonly Unit[] = EMPTY;
  private teamCache = new Map<Team, Unit[]>();
  private aiCache = new Map<Team, Unit[]>();
  private listeners = new Set<() => void>();

  /** Returns an unregister function, for use as an effect cleanup. */
  register(def: UnitDef): () => void {
    if (process.env.NODE_ENV !== "production" && this.units.has(def.id)) {
      console.warn(`[UnitRegistry] duplicate id "${def.id}", replacing`);
    }
    // `body.position` is cached by reference, so it must be a stable Vector3
    // that the owner mutates in place — not a fresh vector from a getter.
    const unit: Unit = { ...def, position: def.body.position };
    this.units.set(def.id, unit);
    this.rebuild();

    return () => {
      // Identity check: a stale cleanup must not remove a newer registration
      if (this.units.get(def.id) !== unit) return;
      this.units.delete(def.id);
      this.rebuild();
    };
  }

  get(id: string): Unit | undefined {
    return this.units.get(id);
  }
  all(): readonly Unit[] {
    return this.list;
  }
  byTeam(team: Team): readonly Unit[] {
    return this.teamCache.get(team) ?? EMPTY;
  }
  aiByTeam(team: Team): readonly Unit[] {
    return this.aiCache.get(team) ?? EMPTY;
  }

  // Arrow properties keep a stable identity for useSyncExternalStore.
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.list;

  debugSnapshot() {
    return this.list.map((u) => ({
      id: u.id,
      team: u.team,
      kind: u.kind,
      ai: u.ai,
      radius: u.radius,
      x: +u.position.x.toFixed(2),
      z: +u.position.z.toFixed(2),
      heading: +u.body.heading.toFixed(2),
    }));
  }

  // Runs only on register/unregister, so per-frame reads allocate nothing.
  private rebuild() {
    this.list = [...this.units.values()];
    this.teamCache.clear();
    this.aiCache.clear();
    for (const u of this.list) {
      let t = this.teamCache.get(u.team);
      if (!t) this.teamCache.set(u.team, (t = []));
      t.push(u);
      if (u.ai) {
        let a = this.aiCache.get(u.team);
        if (!a) this.aiCache.set(u.team, (a = []));
        a.push(u);
      }
    }
    this.listeners.forEach((l) => l());
  }
}
