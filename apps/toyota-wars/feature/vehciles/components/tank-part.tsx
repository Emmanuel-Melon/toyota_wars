// apps/toyota-wars/feature/vehciles/components/tank-part.tsx
"use client";

import { HealthBar } from "@/feature/combat/components/health-bar";
import type { ReactNode } from "react";

type TankPartProps = {
  position?: [number, number, number];
  health: number;
  maxHealth: number;
  barColor: string;
  barPosition: [number, number, number];
  showHealthBar?: boolean;
  children: ReactNode;
};

/** A damageable vehicle section: geometry + its own health bar. */
export function TankPart({
  position = [0, 0, 0],
  health,
  maxHealth,
  barColor,
  barPosition,
  showHealthBar = true,
  children,
}: TankPartProps) {
  return (
    <group position={position}>
      {children}
      {showHealthBar && (
        <HealthBar
          value={health}
          max={maxHealth}
          color={barColor}
          position={barPosition}
        />
      )}
    </group>
  );
}
