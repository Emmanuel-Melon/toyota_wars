import { DEFAULT_MODEL_FOR_WEAPON } from "../vehicles/vehicle.config";
import type { WeaponId } from "@toyota/combat";
import type { SpawnConfig, VehicleSpawn } from "./map.types";

// mulberry32: tiny, fast, good enough for gameplay
export function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickWeapon(
  weights: Partial<Record<WeaponId, number>> | undefined,
  rng: Rng,
): WeaponId {
  const entries = Object.entries(weights ?? {}) as [WeaponId, number][];
  if (entries.length === 0) return "dshk";
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [weapon, w] of entries) {
    roll -= w;
    if (roll <= 0) return weapon;
  }
  return entries[entries.length - 1][0];
}

function rollWeapons(cfg: SpawnConfig, rng: Rng): WeaponId[] {
  return Array.from({ length: cfg.count }, () =>
    pickWeapon(cfg.weaponWeights, rng),
  );
}

function dealPalettes(cfg: SpawnConfig, rng: Rng): VehicleSpawn["palette"][] {
  const result: VehicleSpawn["palette"][] = [];
  while (result.length < cfg.count) {
    result.push(...shuffle(cfg.palettes, rng));
  }
  return result.slice(0, cfg.count);
}

export function scatterPoints({
  rng,
  center,
  radius,
  count,
  minSeparation,
  isValid,
}: {
  rng: Rng;
  center: [number, number];
  radius: number;
  count: number;
  minSeparation: number;
  isValid?: (x: number, z: number) => boolean;
}): [number, number][] {
  const placed: [number, number][] = [];
  const minSq = minSeparation ** 2;
  let scatterRadius = radius;

  while (placed.length < count) {
    let found: [number, number] | null = null;

    for (let attempt = 0; attempt < 40 && !found; attempt++) {
      const angle = rng() * Math.PI * 2;
      const r = scatterRadius * Math.sqrt(rng());
      const x = center[0] + Math.cos(angle) * r;
      const z = center[1] + Math.sin(angle) * r;

      const clear = placed.every(
        ([px, pz]) => (px - x) ** 2 + (pz - z) ** 2 >= minSq,
      );
      if (clear && (isValid?.(x, z) ?? true)) found = [x, z];
    }

    if (found) placed.push(found);
    else scatterRadius *= 1.1;
  }
  return placed;
}

function scatterPositions(cfg: SpawnConfig, rng: Rng): [number, number][] {
  return scatterPoints({
    rng,
    center: cfg.center,
    radius: cfg.radius,
    count: cfg.count,
    minSeparation: cfg.minSeparation,
    isValid: cfg.isValid,
  });
}

function headingFor(cfg: SpawnConfig, [x, z]: [number, number], rng: Rng) {
  const jitter = (rng() - 0.5) * 2 * (cfg.headingJitter ?? 0);
  if (typeof cfg.facing === "number") return cfg.facing + jitter;
  const [tx, tz] = cfg.facing.toward;
  return Math.atan2(tx - x, tz - z) + jitter;
}

export function createSpawns(cfg: SpawnConfig): VehicleSpawn[] {
  const rng = createRng(cfg.seed);
  const positions = scatterPositions(cfg, rng);
  const weapons = rollWeapons(cfg, rng);
  const palettes = dealPalettes(cfg, rng);

  return positions.map((position, i) => ({
    position,
    rotationY: headingFor(cfg, position, rng),
    palette: palettes[i],
    model: DEFAULT_MODEL_FOR_WEAPON[weapons[i]],
    weapon: weapons[i],
    formationOffset: cfg.formation?.(i, cfg.count),
  }));
}
