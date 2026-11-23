import type { Curve } from "./types";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const remap = (v: number, min: number, max: number) => {
  const span = max - min;
  if (span === 0) return v >= max ? 1 : 0;
  return clamp01((v - min) / span);
};

export const curves = {
  linear: (): Curve => (x) => clamp01(x),
  invert: (): Curve => (x) => 1 - clamp01(x),
  power:
    (p = 2): Curve =>
    (x) =>
      Math.pow(clamp01(x), p),
  invPower:
    (p = 2): Curve =>
    (x) =>
      1 - Math.pow(1 - clamp01(x), p),
  logistic:
    (midpoint = 0.5, steepness = 10): Curve =>
    (x) =>
      clamp01(1 / (1 + Math.exp(-steepness * (clamp01(x) - midpoint)))),
  step:
    (threshold: number): Curve =>
    (x) =>
      x >= threshold ? 1 : 0,
  constant:
    (v: number): Curve =>
    () =>
      clamp01(v),
} as const;
