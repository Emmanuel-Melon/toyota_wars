import type { WeaponMountProps } from "../types";
import { DshkMount } from "./dshk-mount";
import { Type63Mount } from "./type63-mount";
import { Zu23Mount } from "./zu23-mount";

export function WeaponMount({ kind, palette }: WeaponMountProps) {
  switch (kind) {
    case "heavyMg":
      return <DshkMount palette={palette} />;
    case "autocannon":
      return <Zu23Mount palette={palette} />;
    case "rocketPod":
      return <Type63Mount palette={palette} />;
  }
}
