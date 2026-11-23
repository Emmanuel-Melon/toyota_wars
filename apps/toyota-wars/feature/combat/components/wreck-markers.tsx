"use client";

import { Html } from "@react-three/drei";
import { useSyncExternalStore } from "react";
import { COMBAT_CONFIG } from "@/lib/combat/combat.config";
import {
  WRECK_LOOT,
  type Wreck,
  type WreckLootType,
} from "@/lib/combat/wreck.registry";
import { useBattle } from "@/context/battle-context";
import { cn } from "@/lib/utils";
import styles from "./wreck-markers.module.css";

const LOOT_STYLES: Record<WreckLootType, string> = {
  [WRECK_LOOT.HEALTH]: styles.health,
  [WRECK_LOOT.AMMO]: styles.ammo,
};

function LootIcon({ type }: { type: WreckLootType }) {
  if (type === WRECK_LOOT.HEALTH) {
    return (
      <svg className={styles.lootIcon} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M12 3h8v9h9v8h-9v9h-8v-9H3v-8h9V3z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className={styles.lootIcon} viewBox="0 0 32 32" aria-hidden="true">
      {[5, 13, 21].map((x) => (
        <g key={x}>
          <rect x={x} y="12" width="6" height="15" rx="3" fill="currentColor" />
          <path
            d={`M${x} 13 L${x + 3} 4 L${x + 6} 13 Z`}
            fill="currentColor"
            opacity="0.85"
          />
        </g>
      ))}
    </svg>
  );
}

function WreckMarker({ wreck }: { wreck: Wreck }) {
  if (!wreck.loot || wreck.collected) return null;

  return (
    <Html
      position={[
        wreck.position.x,
        wreck.position.y + COMBAT_CONFIG.WRECK_MARKER_HEIGHT,
        wreck.position.z,
      ]}
      center
      zIndexRange={[30, 0]}
      style={{ pointerEvents: "none" }}
    >
      <div className={cn(styles.marker, LOOT_STYLES[wreck.loot.type])}>
        <div className={styles.medal}>
          <div className={styles.ribbon} />
          <div className={styles.disc}>★</div>
        </div>
        <div className={styles.loot}>
          <LootIcon type={wreck.loot.type} />
        </div>
      </div>
    </Html>
  );
}

export function WreckMarkers() {
  const { wrecks } = useBattle();
  const snapshot = useSyncExternalStore(
    wrecks.subscribe,
    wrecks.getSnapshot,
    wrecks.getSnapshot,
  );

  return (
    <>
      {snapshot.map((wreck) =>
        wreck.collected ? null : <WreckMarker key={wreck.id} wreck={wreck} />,
      )}
    </>
  );
}
