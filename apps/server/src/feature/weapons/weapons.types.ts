// apps/api/src/modules/weapons/weapons.types.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { weaponsSchema } from "./weapons.schema";

extendZodWithOpenApi(z);

export const weaponMechanismSchema = z.enum(["projectile", "rocket"]);

export const weaponMuzzleSchema = z.object({
  height: z.number(),
  forwardOffset: z.number(),
});

export const weaponMuzzleEmitterSchema = z.object({
  right: z.number(),
});

export const weaponProjectileSchema = z.object({
  speed: z.number().positive(),
  life: z.number().positive(),
  gravity: z.number().nonnegative(),
  drag: z.number().nonnegative(),
  hitRadius: z.number().positive(),
  damage: z.number().positive(),
});

export const weaponAudioSchema = z.object({
  kind: z.string().min(1), // e.g. "heavyMg" | "autocannon" | "rocket"
});

export const weaponVisualSchema = z.object({
  mount: z.string().min(1), // e.g. "heavyMg" | "autocannon" | "rocketPod"
  projectile: z.object({
    size: z.number().positive(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    emissive: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  muzzleFlash: z.object({
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    size: z.number().positive(),
    duration: z.number().positive(),
  }),
});

export const weaponExplosionSchema = z.object({
  radius: z.number().positive(),
  triggerRadius: z.number().positive(),
  damage: z.number().positive(),
  minDamageRatio: z.number().min(0).max(1),
  duration: z.number().positive(),
  fireColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  shockwaveColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  friendlyFire: z.boolean(),
});

const weaponColumnOverrides = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  mechanism: weaponMechanismSchema,
  muzzle: weaponMuzzleSchema,
  muzzles: z.array(weaponMuzzleEmitterSchema).nullable().optional(),
  projectile: weaponProjectileSchema,
  audio: weaponAudioSchema,
  visual: weaponVisualSchema,
  explosion: weaponExplosionSchema.nullable().optional(),
};

export const weaponsSelectSchema = createSelectSchema(
  weaponsSchema,
  weaponColumnOverrides,
).openapi({
  title: "WeaponConfig",
  description: "Weapon ballistics, cooldowns, audio, and Three.js visual configuration",
});

export const weaponsInsertSchema = createInsertSchema(
  weaponsSchema,
  weaponColumnOverrides,
).openapi({
  title: "CreateWeaponRequest",
});

export type WeaponMuzzle = z.infer<typeof weaponMuzzleSchema>;
export type WeaponMuzzleEmitter = z.infer<typeof weaponMuzzleEmitterSchema>;
export type WeaponProjectile = z.infer<typeof weaponProjectileSchema>;
export type WeaponAudio = z.infer<typeof weaponAudioSchema>;
export type WeaponVisual = z.infer<typeof weaponVisualSchema>;
export type WeaponExplosion = z.infer<typeof weaponExplosionSchema>;
export type WeaponConfig = z.infer<typeof weaponsSelectSchema>;
export type NewWeaponConfig = z.infer<typeof weaponsInsertSchema>;