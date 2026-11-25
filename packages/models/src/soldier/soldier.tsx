// soldier/soldier.tsx
import type { ComponentProps } from "react";
import { SoldierArms } from "./parts/arms";
import { SoldierHead } from "./parts/head";
import { SoldierLegs } from "./parts/legs";
import { SoldierTorso } from "./parts/torso";
import { resolveSoldierPalette } from "./soldier.palette";
import { useSoldierAssets } from "./soldier.assets";
import {
  DEFAULT_LOADOUT,
  type SoldierLoadout,
  type SoldierPalette,
  type SoldierPose,
} from "./soldier.types";

export type SoldierProps = Omit<ComponentProps<"group">, "ref"> & {
  pose: SoldierPose;
  palette?: SoldierPalette;
  loadout?: Partial<SoldierLoadout>;
};

export function Soldier({ pose, palette, loadout, ...groupProps }: SoldierProps) {
  const assets = useSoldierAssets(resolveSoldierPalette(palette));
  const gear: SoldierLoadout = { ...DEFAULT_LOADOUT, ...loadout };

  return (
    <group {...groupProps}>
      <SoldierLegs pose={pose} assets={assets} />
      <SoldierTorso assets={assets} loadout={gear} />
      <SoldierArms pose={pose} assets={assets} />
      <SoldierHead assets={assets} loadout={gear} />
    </group>
  );
}