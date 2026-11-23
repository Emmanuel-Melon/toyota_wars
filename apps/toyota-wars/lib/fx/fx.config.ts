// apps/toyota-wars/lib/fx/fx.config.ts
import { WEAPONS } from "@/lib/weapons/weapon.config";
import type { WeaponFx, WeaponId } from "@/lib/weapons/weapon.types";

export function getWeaponFx(weapon: WeaponId): WeaponFx {
  return WEAPONS[weapon].fx;
}
