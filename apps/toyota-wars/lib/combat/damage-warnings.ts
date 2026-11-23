/**
 * Module-level store so both the Canvas tree (bridge) and the DOM tree (HUD)
 * can share state. React context does not cross the r3f root boundary.
 */

export type DamageWarning = {
  id: number;
  /** World angle from player → source, `atan2(dx, -dz)`. Radians. */
  worldAngle: number;
  /** 0..1 — drives opacity / glow. */
  intensity: number;
  /** `performance.now()` at report time. */
  createdAt: number;
  /** Lifetime in ms. */
  durationMs: number;
};

let warnings: readonly DamageWarning[] = [];
const listeners = new Set<() => void>();
let nextId = 1;
const MAX_WARNINGS = 16;

/** Player heading in the same `atan2(dx, -dz)` convention. Bridge writes this. */
export const playerHeadingRef = { current: 0 };

function notify() {
  for (const cb of listeners) cb();
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getSnapshot(): readonly DamageWarning[] {
  return warnings;
}

/**
 * `worldAngle` is measured from the player, with 0 = north (−Z) and +π/2 = east (+X).
 * Compute it as `Math.atan2(source.x - player.x, -(source.z - player.z))`.
 */
export function report(
  worldAngle: number,
  intensity: number,
  durationMs = 1400,
) {
  const id = nextId++;
  warnings = [
    ...warnings,
    {
      id,
      worldAngle,
      intensity: Math.max(0, Math.min(1, intensity)),
      createdAt: performance.now(),
      durationMs,
    },
  ];
  if (warnings.length > MAX_WARNINGS) {
    warnings = warnings.slice(warnings.length - MAX_WARNINGS);
  }
  notify();

  setTimeout(() => {
    const next = warnings.filter((w) => w.id !== id);
    if (next.length !== warnings.length) {
      warnings = next;
      notify();
    }
  }, durationMs);
}

/** Used by BattleResetEffects-style cleanup. */
export function clearDamageWarnings() {
  if (warnings.length === 0) return;
  warnings = [];
  notify();
}
