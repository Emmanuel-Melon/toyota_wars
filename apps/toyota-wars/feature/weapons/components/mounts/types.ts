import type { VehiclePalette } from "@/lib/palettes";
import type { WeaponMountKind } from "@/lib/weapons/weapon.types";

export type MountProps = { palette: VehiclePalette };

export type WeaponMountProps = MountProps & {
  kind: WeaponMountKind;
};
