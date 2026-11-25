// soldier/soldier.types.ts
export type V3 = [number, number, number];
export type Side = -1 | 1;

export interface ResolvedSoldierPalette {
  skin: string;
  helmet: string;
  lens: string;
  boots: string;
  glove: string;
  vest: string;
  uniform: string; // NOTE: assumed key, align with your palette
  gear: string;    // NOTE: assumed key (straps, pouches, belt)
}

export type SoldierPalette = Partial<ResolvedSoldierPalette>;

export interface ArmPose { elbow: V3; hand: V3 }
export interface LegPose { hip: V3; knee: V3; ankle: V3 }

export interface SoldierPose {
  /** Distance from the soldier's origin (pelvis) to the soles. Used to stand on terrain. */
  pelvisHeight: number;
  arms: Record<Side, ArmPose>;
  legs: Record<Side, LegPose>;
}

export interface SoldierLoadout {
  helmet: boolean;
  goggles: boolean;
  headset: boolean;
  vest: boolean;
  radio: boolean;
}

export const DEFAULT_LOADOUT: SoldierLoadout = {
  helmet: true,
  goggles: true,
  headset: true,
  vest: true,
  radio: true,
};