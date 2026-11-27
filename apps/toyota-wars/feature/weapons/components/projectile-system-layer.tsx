// apps/toyota-wars/feature/weapons/components/projectile-system-layer.tsx
"use client";

import { useCallback } from "react";
import type { VehiclePart } from "@toyota/combat";
import { useCombat } from "@/context/combat-context";
import { usePlayer } from "@/context/player-context";
import { useTargets } from "@/context/targets-context";
import { ProjectileSystem } from "./projectile-system";
import { FxAudio } from "../../fx/components/fx-audio";
import { useProjectileSystem } from "../../../context/battle-context";

export function ProjectileSystemLayer() {
  const { health, onHit, onKill, getHealth, recordPlayerDamage } = useCombat();
  const { paused, playerBody } = usePlayer();
  const { projectileTargets } = useTargets();
  const projectiles = useProjectileSystem();

  const handleHit = useCallback(
    (
      id: string,
      part: VehiclePart,
      damage: number,
      source: "player" | "ai",
    ) => {
      onHit(id, part, damage);
      if (source === "player") {
        recordPlayerDamage(id, damage);
      }
    },
    [onHit, recordPlayerDamage],
  );

  return (
    <>
      <ProjectileSystem
        systemRef={projectiles}
        targets={projectileTargets}
        health={health}
        getHealth={getHealth}
        onHit={handleHit}
        onKill={onKill}
        listener={playerBody.position}
        paused={paused}
      />
      <FxAudio />
    </>
  );
}
