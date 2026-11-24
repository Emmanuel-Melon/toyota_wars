import type { usePlayer } from "@/context/player-context";
import type { useRadar } from "@/context/radar-context";
import type { useTargets } from "@/context/targets-context";
import type { useCombat } from "@/context/combat-context";
import type { useArena } from "@/context/arena-context";
import type { MissionObjective } from "@/lib/missions/direction/mission.hud";

/** Snapshot read once per frame by the draw loop. */
export type MinimapState = {
  objective: MissionObjective | null;
  playerBody: ReturnType<typeof usePlayer>["playerBody"];
  allyTargets: ReturnType<typeof useTargets>["allyTargets"];
  enemies: ReturnType<typeof useTargets>["enemies"];
  enemiesVisible: ReturnType<typeof useRadar>["radarOnline"];
  health: ReturnType<typeof useCombat>["health"];
  arena: ReturnType<typeof useArena>;
};

/** World-space → canvas-space projection for the current frame. */
export type Projection = {
  size: number;
  scale: number;
  toX: (worldX: number) => number;
  toY: (worldZ: number) => number;
};

/** Everything a draw pass needs. Kept flat so passes stay one-liners. */
export type DrawContext = {
  ctx: CanvasRenderingContext2D;
  time: number;
  size: number;
  projection: Projection;
  state: MinimapState;
};
