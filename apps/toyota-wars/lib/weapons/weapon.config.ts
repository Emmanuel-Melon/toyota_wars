import type {
  WeaponConfig,
  WeaponId,
  WeaponMuzzleEmitter,
} from "./weapon.types";
import { dshkWeapon } from "./definitions/dshk.weapon";
import { zu23Weapon } from "./definitions/zu23.weapon";
import { type63Weapon } from "./definitions/type63.weapon";

export const DEFAULT_MUZZLES: readonly WeaponMuzzleEmitter[] = [{ right: 0 }];

export const DEFAULT_WEAPON_ID: WeaponId = "zu23";
export const DEFAULT_PLAYER_WEAPON_ID: WeaponId = "zu23";

export const WEAPONS: Record<WeaponId, WeaponConfig> = {
  dshk: dshkWeapon,
  zu23: zu23Weapon,
  type63: type63Weapon,
};
