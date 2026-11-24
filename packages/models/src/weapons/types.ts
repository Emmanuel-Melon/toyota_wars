import type { VehiclePalette, WeaponMountKind } from "../vehicle/types";

export type { VehiclePalette, WeaponMountKind } from "../vehicle/types";

export type MountProps = { palette: VehiclePalette };

export type WeaponMountProps = MountProps & {
  kind: WeaponMountKind;
};
