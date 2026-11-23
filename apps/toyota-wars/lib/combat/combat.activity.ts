let lastActivityAt = Number.NEGATIVE_INFINITY;

export function markCombatActivity(now: number = performance.now()): void {
  lastActivityAt = now;
}

export function isCombatActive(
  windowMs: number,
  now: number = performance.now(),
): boolean {
  return now - lastActivityAt < windowMs;
}

export function resetCombatActivity(): void {
  lastActivityAt = Number.NEGATIVE_INFINITY;
}
