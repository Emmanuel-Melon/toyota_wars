// soldier/index.ts
export { Soldier, type SoldierProps } from "./soldier";
export { resolveSoldierPalette, DEFAULT_SOLDIER_PALETTE } from "./soldier.palette";
export * as poses from "./poses";
export type {
  SoldierPalette, ResolvedSoldierPalette, SoldierPose, SoldierLoadout, ArmPose, LegPose, V3,
} from "./soldier.types";