// apps/toyota-wars/lib/fx/fx.config.ts
import { WEAPONS, type WeaponFx, type WeaponId } from "@toyota/combat";

export function getWeaponFx(weapon: WeaponId): WeaponFx {
  return WEAPONS[weapon].fx;
}
