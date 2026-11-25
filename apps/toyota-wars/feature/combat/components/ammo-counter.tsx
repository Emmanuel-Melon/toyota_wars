import { memo } from "react";
import styles from "./ammo-counter.module.css";

type AmmoCounterProps = {
  current: number;
  capacity: number;
  label?: string;
  maxPips?: number;
  compact?: boolean;
};

const LOW_THRESHOLD = 0.25;

const Pip = memo(function Pip({ fill }: { fill: number }) {
  return (
    <span className={styles.pip} aria-hidden="true">
      <span
        className={styles.pipFill}
        style={{ clipPath: `inset(${(1 - fill) * 100}% 0 0 0)` }}
      />
    </span>
  );
});

export function AmmoCounter({
  current,
  capacity,
  label = "AMMO",
  maxPips = 20,
  compact = false,
}: AmmoCounterProps) {
  const cap = Math.max(1, capacity);
  const pips = Math.max(1, Math.min(maxPips, cap));
  const perPip = cap / pips;
  const state = current <= 0 ? "empty" : current / cap <= LOW_THRESHOLD ? "low" : "ok";

  return (
    <div
      className={styles.root}
      data-state={state}
      data-compact={compact ? "true" : undefined}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={cap}
      aria-valuenow={current}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>
          <span className={styles.current}>{current}</span>
          <span className={styles.capacity}>/ {cap}</span>
        </span>
      </div>
      <div className={styles.row}>
        {Array.from({ length: pips }, (_, i) => (
          <Pip
            key={i}
            fill={Math.min(1, Math.max(0, (current - i * perPip) / perPip))}
          />
        ))}
      </div>
    </div>
  );
}
