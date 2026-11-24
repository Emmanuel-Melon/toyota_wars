import type { Mission, Squad, Vec2 } from "../missions.types";

export interface MissionHost {
  setupArena(
    arena: Mission["arena"],
    squads: readonly Pick<Squad, "team" | "spawnPoints">[],
    clearancePoints?: readonly Vec2[],
  ): void;

  spawnSquad(squad: Squad): { unitId: string; isLeader: boolean }[];

  cleanup?(): void;

  resetPlayerHealth?(): void;

  getUnitPositions?(): ReadonlyMap<string, Vec2>;
}
