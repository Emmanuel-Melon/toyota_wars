// apps/toyota-wars/feature/effects/effects.registry.ts
import type { EffectEntry } from "./effects.types";
import { MuzzleFlashFx } from "./components/muzzle-flash.fx";
import { ImpactFx } from "./components/impact.fx";
import { ProjectileExplosionFx } from "./components/projectile-explosion.fx";
import { TracerFx } from "./components/tracer.fx";
import { CasingFx } from "./components/casing.fx";
import { VehicleExplosionFx } from "./components/vehicle-explosion.fx";
import { VehicleDestroyedFxBridge } from "./components/vehicle-destroyed-bridge";

export const EFFECTS: readonly EffectEntry[] = [
  { id: "muzzle-flash", Component: MuzzleFlashFx },
  { id: "impact", Component: ImpactFx },
  { id: "projectile-explosion", Component: ProjectileExplosionFx },
  { id: "tracer", Component: TracerFx },
  { id: "casing", Component: CasingFx },
  { id: "vehicle-explosion", Component: VehicleExplosionFx },
  { id: "vehicle-destroyed-bridge", Component: VehicleDestroyedFxBridge },
];
