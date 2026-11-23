// apps/toyota-wars/feature/effects/effects.types.ts
import type { ComponentType } from "react";
import type { ProjectileSlot } from "@/lib/weapons/weapon.projectile";

export type EffectProps = {
  projectiles: readonly ProjectileSlot[];
  paused: boolean;
};

export type EffectEntry = {
  id: string;
  Component: ComponentType<EffectProps>;
};
