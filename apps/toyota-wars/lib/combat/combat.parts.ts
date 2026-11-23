// lib/combat/combat.parts.ts
import { partId, type VehiclePart } from "./combat.teams";
import type { PartHealthMap } from "./combat.types";

export type PartCategory = "armor" | "weapon" | "wheel" | "door" | "glass";

export type VehicleDamageEffects = {
  maxSpeedFactor: number;
  accelerationFactor: number;
  turnRateFactor: number;
  tractionFactor: number;
  weaponDisabled: boolean;
  visionPenalty: number;
  disabledWheelCount: number;
};

export type PartMeta = {
  label: string;
  category: PartCategory;
  maxHealthRatio: number;
};

export const VEHICLE_PARTS: readonly VehiclePart[] = [
  "body",
  "hood",
  "turret",
  "wheelFL",
  "wheelFR",
  "wheelRL",
  "wheelRR",
  "doorFL",
  "doorFR",
  "doorRL",
  "doorRR",
  "windshield",
  "windowFL",
  "windowFR",
  "windowRL",
  "windowRR",
  "windowRear",
];

export const PART_CATALOG: Record<VehiclePart, PartMeta> = {
  body: { label: "Hull", category: "armor", maxHealthRatio: 1 },
  hood: { label: "Hood", category: "armor", maxHealthRatio: 0.35 },
  turret: { label: "Weapon", category: "weapon", maxHealthRatio: 1 },
  wheelFL: {
    label: "Front Left Wheel",
    category: "wheel",
    maxHealthRatio: 0.45,
  },
  wheelFR: {
    label: "Front Right Wheel",
    category: "wheel",
    maxHealthRatio: 0.45,
  },
  wheelRL: {
    label: "Rear Left Wheel",
    category: "wheel",
    maxHealthRatio: 0.45,
  },
  wheelRR: {
    label: "Rear Right Wheel",
    category: "wheel",
    maxHealthRatio: 0.45,
  },
  doorFL: { label: "Front Left Door", category: "door", maxHealthRatio: 0.6 },
  doorFR: { label: "Front Right Door", category: "door", maxHealthRatio: 0.6 },
  doorRL: { label: "Rear Left Door", category: "door", maxHealthRatio: 0.6 },
  doorRR: { label: "Rear Right Door", category: "door", maxHealthRatio: 0.6 },
  windshield: { label: "Windshield", category: "glass", maxHealthRatio: 0.25 },
  windowFL: {
    label: "Front Left Window",
    category: "glass",
    maxHealthRatio: 0.25,
  },
  windowFR: {
    label: "Front Right Window",
    category: "glass",
    maxHealthRatio: 0.25,
  },
  windowRL: {
    label: "Rear Left Window",
    category: "glass",
    maxHealthRatio: 0.25,
  },
  windowRR: {
    label: "Rear Right Window",
    category: "glass",
    maxHealthRatio: 0.25,
  },
  windowRear: { label: "Rear Window", category: "glass", maxHealthRatio: 0.25 },
};

export function partMaxHealth(
  part: VehiclePart,
  unitMaxHealth: number,
): number {
  return Math.max(
    1,
    Math.round(unitMaxHealth * PART_CATALOG[part].maxHealthRatio),
  );
}

export function partHealthRatio(
  value: number | undefined,
  part: VehiclePart,
  unitMaxHealth: number,
): number {
  if (value === undefined) return 1;
  return Math.max(0, Math.min(1, value / partMaxHealth(part, unitMaxHealth)));
}

export function isPartDestroyed(
  value: number | undefined,
  part: VehiclePart,
  unitMaxHealth: number,
): boolean {
  return partHealthRatio(value, part, unitMaxHealth) <= 0;
}

const WHEEL_PARTS: readonly VehiclePart[] = [
  "wheelFL",
  "wheelFR",
  "wheelRL",
  "wheelRR",
];

const GLASS_WEIGHTS: Partial<Record<VehiclePart, number>> = {
  windshield: 0.3,
  windowFL: 0.12,
  windowFR: 0.12,
  windowRL: 0.1,
  windowRR: 0.1,
  windowRear: 0.06,
};

export function getVehicleDamageEffects(
  partHealth: Readonly<Partial<Record<VehiclePart, number>>> | undefined,
  maxHealth: number,
): VehicleDamageEffects {
  const destroyed = (part: VehiclePart) =>
    partHealthRatio(partHealth?.[part], part, maxHealth) <= 0;

  let frontWheelsDown = 0;
  let rearWheelsDown = 0;
  for (const part of WHEEL_PARTS) {
    if (!destroyed(part)) continue;
    if (part.startsWith("wheelF")) frontWheelsDown += 1;
    else rearWheelsDown += 1;
  }

  const intactWheels = WHEEL_PARTS.length - frontWheelsDown - rearWheelsDown;
  let visionPenalty = 0;
  for (const [part, weight] of Object.entries(GLASS_WEIGHTS)) {
    if (destroyed(part as VehiclePart)) visionPenalty += weight ?? 0;
  }

  return {
    maxSpeedFactor: Math.max(0.4, 0.4 + intactWheels * 0.15),
    accelerationFactor: Math.max(0.25, 0.25 + intactWheels * 0.1875),
    turnRateFactor: Math.max(
      0.15,
      1 - frontWheelsDown * 0.28 - rearWheelsDown * 0.1,
    ),
    tractionFactor: Math.max(
      0.35,
      1 - (frontWheelsDown + rearWheelsDown) * 0.16,
    ),
    weaponDisabled: destroyed("turret"),
    visionPenalty: Math.min(0.75, visionPenalty),
    disabledWheelCount: frontWheelsDown + rearWheelsDown,
  };
}

export function projectPartHealth(
  source: PartHealthMap,
  id: string,
  maxHealth: number,
): Partial<Record<VehiclePart, number>> {
  const result: Partial<Record<VehiclePart, number>> = {};
  for (const part of VEHICLE_PARTS) {
    result[part] = source[partId(id, part)] ?? partMaxHealth(part, maxHealth);
  }
  return result;
}
