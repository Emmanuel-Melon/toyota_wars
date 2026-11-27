// lib/weapons/weapon.bloom.ts
export type WeaponBloomConfig = {
  speedFactor: number;
  bloomPerShot: number;
  maxBloom: number;
  recoveryRate: number;
};

export const DEFAULT_WEAPON_BLOOM_CONFIG: WeaponBloomConfig = {
  speedFactor: 0.003,
  bloomPerShot: 0.008,
  maxBloom: 0.08,
  recoveryRate: 8.0,
};

export class WeaponBloomSystem {
  private bloom = 0;
  private readonly config: WeaponBloomConfig;

  constructor(config: Partial<WeaponBloomConfig> = {}) {
    this.config = { ...DEFAULT_WEAPON_BLOOM_CONFIG, ...config };
  }

  registerShot(): void {
    this.bloom = Math.min(
      this.config.maxBloom,
      this.bloom + this.config.bloomPerShot,
    );
  }

  update(delta: number, firing: boolean): void {
    if (!firing) {
      this.bloom = Math.max(
        0,
        this.bloom - this.config.recoveryRate * Math.max(0, delta),
      );
    }
  }

  getSpreadAngle(vehicleSpeed: number, baseSpread = 0): number {
    return (
      baseSpread + Math.abs(vehicleSpeed) * this.config.speedFactor + this.bloom
    );
  }
}
