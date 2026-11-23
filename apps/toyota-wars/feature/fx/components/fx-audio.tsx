// components/plains/three/fx/fx-audio.tsx
"use client";

import { ProceduralGunshot } from "@/lib/audio/audio.gunshot";
import { ProceduralAudio } from "@/lib/audio/audio.procedural";
import { usePlayer } from "@/context/player-context";
import { useFxEvent } from "@/context/fx-context";

export function FxAudio() {
  const { playerBody } = usePlayer();
  useFxEvent("shot", (e) => {
    if (e.source === "player" && e.barrel === 0) {
      ProceduralGunshot.play(e.weapon);
    }
  });
  useFxEvent("explosion", () => ProceduralAudio.playExplosion());
  useFxEvent("whizz", ({ point }) =>
    ProceduralAudio.playBulletWhizz((point.x - playerBody.position.x) / 8),
  );
  useFxEvent("obstacleHit", () => ProceduralAudio.playRockImpact());
  return null;
}
