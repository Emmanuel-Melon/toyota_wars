// lib/missions/host/mission.host.ts
import type {
  Mission,
  Squad,
  Vec2,
} from "@/lib/missions/definition/mission.types";

/**
 * Inversion-of-control boundary: what the runner needs FROM the game
 * (spawning and arena setup). The game implements this; it never imports
 * anything from engine/ or definitions/.
 */
export interface MissionHost {
  /** Place the player and build the arena (seed, size, obstacles). Called once on start. */
  setupArena(
    arena: Mission["arena"],
    squads: readonly Pick<Squad, "team" | "spawnPoints">[],
    clearancePoints?: readonly Vec2[],
  ): void;

  /**
   * Spawn a squad and return its unit ids.
   * The ids are what the game later emits in `unitDestroyed`.
   */
  spawnSquad(squad: Squad): { unitId: string; isLeader: boolean }[];

  /** Despawn everything the mission created. Called on load, reset and abort. */
  cleanup?(): void;

  /** Restore the player to full health (the `restoreHull` squad effect). */
  resetPlayerHealth?(): void;

  /**
   * Query: current position of every mission unit, keyed by the ids returned
   * from spawnSquad. The runner reads this each frame instead of being pushed
   * copies; return the same Map you update in place (or a stable snapshot), no
   * per-frame allocation needed. Replaces runner.setUnitPositions and the
   * mission-unit-positions singleton.
   */
  getUnitPositions?(): ReadonlyMap<string, Vec2>;
}
