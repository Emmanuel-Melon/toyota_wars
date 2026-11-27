// apps/toyota-wars/lib/missions/data/secure-the-crossroads/structures.ts
import type { MissionInput } from "@toyota/missions";
import { CROSSROADS } from "./zones";

export const structures: NonNullable<MissionInput["arena"]["structures"]> = [
  {
    id: "crossroads-watchtower-nw",
    structure: "watchtower",
    position: { x: CROSSROADS.x - 38, z: CROSSROADS.z - 38 },
    yaw: Math.PI * 0.25,
    width: 6,
    depth: 6,
    height: 11,
  },
  {
    id: "crossroads-depot-ne",
    structure: "building",
    position: { x: CROSSROADS.x + 42, z: CROSSROADS.z - 30 },
    yaw: 0,
    width: 16,
    depth: 12,
    height: 6,
  },
  {
    id: "crossroads-compound-sw",
    structure: "building",
    position: { x: CROSSROADS.x - 44, z: CROSSROADS.z + 36 },
    yaw: Math.PI / 2,
    width: 14,
    depth: 10,
    height: 5.5,
  },
];
