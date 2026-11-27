// apps/toyota-wars/lib/missions/data/secure-the-crossroads/zones.ts
import type { MissionInput, Vec2 } from "@toyota/missions";

export const CROSSROADS: Vec2 = { x: 0, z: -120 };

export const ROAD_WAYPOINTS: Vec2[] = [{ x: 0, z: 240 }, CROSSROADS];

export const zones: MissionInput["zones"] = [
  { id: "crossroads", position: CROSSROADS, radius: 54 },
  { id: "crossroads-hold", position: CROSSROADS, radius: 75 },
];
