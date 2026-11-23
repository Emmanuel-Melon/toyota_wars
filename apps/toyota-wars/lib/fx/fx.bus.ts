// lib/fx/fx.bus.ts
import type * as THREE from "three";
import type {
  FireRequest,
  ProjectileExplosionEvent,
  Team,
} from "@/lib/combat/combat.types";

export type ShotEvent = {
  slot: number; // index into the projectile pool
  barrel: number; // emitter index (0 = first/primary barrel)
  weapon: FireRequest["weapon"];
  team: Team;
  source: FireRequest["source"];
  origin: THREE.Vector3; // owned copies, safe to keep
  direction: THREE.Vector3; // unit vector
};

export type ImpactEvent = {
  point: THREE.Vector3;
  direction: THREE.Vector3;
  weapon: ShotEvent["weapon"];
  team: Team;
  source: ShotEvent["source"];
  part: string;
};

export type VehicleDestroyedEvent = {
  position: THREE.Vector3;
  unitId: string;
  team: Team;
};

export type FxEventMap = {
  shot: ShotEvent;
  impact: ImpactEvent;
  explosion: ProjectileExplosionEvent;
  vehicleDestroyed: VehicleDestroyedEvent;
  whizz: { point: THREE.Vector3 };
  obstacleHit: { point: THREE.Vector3 };
  casingLand: { position: THREE.Vector3; weapon: ShotEvent["weapon"] };
  clear: Record<string, never>;
};

type Handler<K extends keyof FxEventMap> = (event: FxEventMap[K]) => void;

export class FxBus {
  private handlers: { [K in keyof FxEventMap]: Set<Handler<K>> } = {
    shot: new Set(),
    impact: new Set(),
    explosion: new Set(),
    vehicleDestroyed: new Set(),
    whizz: new Set(),
    obstacleHit: new Set(),
    casingLand: new Set(),
    clear: new Set(),
  };

  on<K extends keyof FxEventMap>(type: K, handler: Handler<K>) {
    const set = this.handlers[type] as Set<Handler<K>>;
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  }

  emit<K extends keyof FxEventMap>(type: K, event: FxEventMap[K]) {
    for (const handler of this.handlers[type] as Set<Handler<K>>)
      handler(event);
  }
}
